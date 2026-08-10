const db = require('../config/db');

// 1. GET ALL PRODUCTS (with filtering & size variants)
exports.getAllProducts = async (req, res) => {
  try {
    const { brand, is_featured } = req.query;
    
    let queryText = `
      SELECT 
        p.id, p.title, p.slug, p.brand, p.description, p.base_price, p.is_featured, p.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'variant_id', pv.id,
              'size', pv.size,
              'stock_quantity', pv.stock_quantity,
              'sku', pv.sku
            )
          ) FILTER (WHERE pv.id IS NOT NULL), '[]'
        ) AS variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
    `;

    const whereClauses = [];
    const queryParams = [];

    if (brand) {
      queryParams.push(brand);
      whereClauses.push(`p.brand ILIKE $${queryParams.length}`);
    }

    if (is_featured !== undefined) {
      queryParams.push(is_featured === 'true');
      whereClauses.push(`p.is_featured = $${queryParams.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += ` WHERE ` + whereClauses.join(' AND ');
    }

    queryText += ` GROUP BY p.id ORDER BY p.created_at DESC;`;

    const result = await db.query(queryText, queryParams);

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: { products: result.rows },
    });
  } catch (error) {
    console.error('Fetch Products Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve products.' });
  }
};

// 2. GET SINGLE PRODUCT BY SLUG (Includes sizes & stock)
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const queryText = `
      SELECT 
        p.id, p.title, p.slug, p.brand, p.description, p.base_price, p.is_featured, p.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'variant_id', pv.id,
              'size', pv.size,
              'stock_quantity', pv.stock_quantity,
              'sku', pv.sku
            ) ORDER BY pv.size ASC
          ) FILTER (WHERE pv.id IS NOT NULL), '[]'
        ) AS variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.slug = $1
      GROUP BY p.id;
    `;

    const result = await db.query(queryText, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Shoe not found.' });
    }

    res.status(200).json({
      status: 'success',
      data: { product: result.rows[0] },
    });
  } catch (error) {
    console.error('Fetch Product Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve product details.' });
  }
};

// 3. ADMIN: CREATE NEW PRODUCT WITH SIZE VARIANTS
exports.createProduct = async (req, res) => {
  const { title, slug, brand, description, base_price, is_featured, variants } = req.body;

  if (!title || !slug || !brand || !base_price) {
    return res.status(400).json({ status: 'fail', message: 'Title, slug, brand, and base_price are required.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN'); // Start SQL Transaction

    // Insert Base Product
    const productResult = await client.query(
      `INSERT INTO products (title, slug, brand, description, base_price, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, slug, brand, description || null, base_price, is_featured || false]
    );

    const newProduct = productResult.rows[0];

    // Insert Shoe Variants/Sizes if provided
    let insertedVariants = [];
    if (variants && Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        const variantResult = await client.query(
          `INSERT INTO product_variants (product_id, size, stock_quantity, sku)
           VALUES ($1, $2, $3, $4)
           RETURNING id, size, stock_quantity, sku`,
          [newProduct.id, v.size, v.stock_quantity || 0, v.sku || null]
        );
        insertedVariants.push(variantResult.rows[0]);
      }
    }

    await client.query('COMMIT'); // Commit Transaction

    res.status(201).json({
      status: 'success',
      data: {
        product: {
          ...newProduct,
          variants: insertedVariants,
        },
      },
    });
  } catch (error) {
    await client.query('ROLLBACK'); // Roll back on failure
    console.error('Create Product Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to create product.' });
  } finally {
    client.release();
  }
};
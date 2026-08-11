const db = require('../config/db');

// Helper function to convert text to URL-friendly slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
};

// =========================================================================
// 1. GET ALL PRODUCTS (Includes aggregation of available variants/sizes)
// =========================================================================
exports.getAllProducts = async (req, res) => {
  try {
    const { category, brand } = req.query;
    let queryText = `
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.description, 
        p.base_price, 
        p.image_url, 
        p.category, 
        p.brand,
        p.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pv.id,
              'size', pv.size,
              'stock_quantity', pv.stock_quantity
            ) ORDER BY pv.size ASC
          ) FILTER (WHERE pv.id IS NOT NULL), '[]'
        ) AS variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
    `;

    const queryParams = [];
    const conditions = [];

    if (category) {
      queryParams.push(category);
      conditions.push(`p.category = $${queryParams.length}`);
    }

    if (brand) {
      queryParams.push(brand);
      conditions.push(`p.brand = $${queryParams.length}`);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryText += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const { rows } = await db.query(queryText, queryParams);

    res.status(200).json({
      status: 'success',
      results: rows.length,
      data: { products: rows },
    });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve products.' });
  }
};

// =========================================================================
// 2. GET SINGLE PRODUCT BY ID (Includes associated variants)
// =========================================================================
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const queryText = `
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.description, 
        p.base_price, 
        p.image_url, 
        p.category, 
        p.brand,
        p.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pv.id,
              'size', pv.size,
              'stock_quantity', pv.stock_quantity
            ) ORDER BY pv.size ASC
          ) FILTER (WHERE pv.id IS NOT NULL), '[]'
        ) AS variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const { rows } = await db.query(queryText, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    res.status(200).json({
      status: 'success',
      data: { product: rows[0] },
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve product.' });
  }
};

// =========================================================================
// 3. GET SINGLE PRODUCT BY SLUG
// =========================================================================
exports.getProductBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const queryText = `
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.description, 
        p.base_price, 
        p.image_url, 
        p.category, 
        p.brand,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pv.id,
              'size', pv.size,
              'stock_quantity', pv.stock_quantity
            ) ORDER BY pv.size ASC
          ) FILTER (WHERE pv.id IS NOT NULL), '[]'
        ) AS variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.slug = $1
      GROUP BY p.id
    `;

    const { rows } = await db.query(queryText, [slug]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    res.status(200).json({
      status: 'success',
      data: { product: rows[0] },
    });
  } catch (error) {
    console.error('Error fetching product by slug:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve product.' });
  }
};

// =========================================================================
// 4. CREATE PRODUCT (Admin - Uses DB Transaction for Product + Variants)
// =========================================================================
exports.createProduct = async (req, res) => {
  const { title, description, base_price, image_url, category, brand, variants } = req.body;

  if (!title || !base_price) {
    return res.status(400).json({ status: 'fail', message: 'Title and base price are required.' });
  }

  const slug = slugify(title);

  // Acquire dedicated client connection for transaction
  const client = typeof db.connect === 'function' ? await db.connect() : await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Insert Base Product
    const productInsertQuery = `
      INSERT INTO products (title, slug, description, base_price, image_url, category, brand)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const productValues = [title, slug, description || null, base_price, image_url || null, category || null, brand || null];
    const productResult = await client.query(productInsertQuery, productValues);
    const newProduct = productResult.rows[0];

    // Insert Variants if provided in req.body
    let insertedVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      for (const variant of variants) {
        const variantInsertQuery = `
          INSERT INTO product_variants (product_id, size, stock_quantity)
          VALUES ($1, $2, $3)
          RETURNING id, size, stock_quantity
        `;
        const variantResult = await client.query(variantInsertQuery, [
          newProduct.id,
          variant.size,
          variant.stock_quantity || 0,
        ]);
        insertedVariants.push(variantResult.rows[0]);
      }
    }

    await client.query('COMMIT');

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
    await client.query('ROLLBACK');
    console.error('Error creating product:', error.message);

    if (error.code === '23505') { 
      return res.status(400).json({ status: 'fail', message: 'A product with this title or slug already exists.' });
    }

    res.status(500).json({ status: 'error', message: 'Failed to create product.' });
  } finally {
    client.release();
  }
};

// =========================================================================
// 5. UPDATE PRODUCT (Admin)
// =========================================================================
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, description, base_price, image_url, category, brand } = req.body;

  try {
    const slug = title ? slugify(title) : undefined;

    const queryText = `
      UPDATE products 
      SET 
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        base_price = COALESCE($4, base_price),
        image_url = COALESCE($5, image_url),
        category = COALESCE($6, category),
        brand = COALESCE($7, brand)
      WHERE id = $8
      RETURNING *
    `;

    const { rows } = await db.query(queryText, [
      title,
      slug,
      description,
      base_price,
      image_url,
      category,
      brand,
      id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    res.status(200).json({
      status: 'success',
      data: { product: rows[0] },
    });
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to update product.' });
  }
};

// =========================================================================
// 6. DELETE PRODUCT (Admin)
// =========================================================================
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await db.query('DELETE FROM products WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete product.' });
  }
};

// =========================================================================
// 7. ADD A VARIANT TO AN EXISTING PRODUCT (Admin)
// =========================================================================
exports.addVariant = async (req, res) => {
  const { id } = req.params; // Product ID
  const { size, stock_quantity } = req.body;

  if (!size || stock_quantity === undefined) {
    return res.status(400).json({ status: 'fail', message: 'Size and stock quantity are required.' });
  }

  try {
    const queryText = `
      INSERT INTO product_variants (product_id, size, stock_quantity)
      VALUES ($1, $2, $3)
      RETURNING id, product_id, size, stock_quantity
    `;
    const { rows } = await db.query(queryText, [id, size, stock_quantity]);

    res.status(201).json({
      status: 'success',
      data: { variant: rows[0] },
    });
  } catch (error) {
    console.error('Error adding variant:', error.message);

    if (error.code === '23505') {
      return res.status(400).json({ status: 'fail', message: 'A variant for this size already exists on this product.' });
    }

    res.status(500).json({ status: 'error', message: 'Failed to add variant.' });
  }
};
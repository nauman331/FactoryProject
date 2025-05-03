const Category = require("../models/Category")

const addCategory = async (req, res) => {
    try {
        const { categoryname } = req.body;

        const category = await Category.create({
            categoryname
        })
        res.status(201).json({ message: 'Category created successfully', category});
    } catch (error) {
        return res.status(400).json({msg: "Error in Creating Category"})
    }
}

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find(); 
    res.json({ categories });
  } catch (err) {
    console.error('Failed to retrieve categories:', err);
    res.status(500).json({ message: 'Failed to retrieve categories', error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category', error: err.message });
  }
};

module.exports = {
    addCategory,
    getCategories,
    deleteCategory
};
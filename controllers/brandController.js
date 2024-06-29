const Brand = require("../models/Brand");
const Watch = require("../models/Watch");

exports.getAllBrands = async (_, res) => {
  try {
    const brands = await Brand.find({});
    return res.json({
      data: {
        brands: brands,
      },
    });
  } catch (err) {
    return res.status(400).json({ message: err.message, error: "Bad Request" });
  }
};

exports.createBrand = async (req, res) => {
  const { brandName } = req.body;
  try {
    if (!brandName) {
      return res
        .status(400)
        .json({ message: "Brand name is required", error: "Bad Request" });
    }
    // Check brandName has already
    const existingBrand = await Brand.findOne({ brandName });
    if (existingBrand) {
      return res
        .status(400)
        .json({ message: "Brand name already exists", error: "Bad Request" });
    }
    // create new brand if check brand have done
    const brand = new Brand({ brandName });
    await brand.save();
    return res.status(201).json({
      data: {
        brandName: brandName,
      },
      message: "Brand created",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateBrand = async (req, res) => {
  const { brandName } = req.body;
  try {
    // Find brand
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res
        .status(404)
        .json({ message: "Brand not found", error: "Not Found" });
    }

    // Check brand from watch
    const watchesWithBrand = await Watch.find({ brand: req.params.id });
    if (watchesWithBrand.length > 0) {
      return res.status(400).json({
        message: "Cannot update brand with associated watches",
        error: "Bad Request",
      });
    }

    // Update brand
    brand.brandName = brandName || brand.brandName;
    await brand.save();
    return res.status(201).json({
      data: {
        brandName: brand.brandName,
      },
      message: "Brand updated",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    // Kiểm tra xem thương hiệu có tồn tại hay không
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res
        .status(404)
        .json({ message: "Brand not found", error: "Not Found" });
    }

    // Kiểm tra xem thương hiệu có bất kỳ đồng hồ nào liên kết với nó hay không
    const watchesWithBrand = await Watch.find({ brand: req.params.id });
    if (watchesWithBrand.length > 0) {
      return res.status(400).json({
        message: "Cannot delete brand with associated watches",
        error: "Bad Request",
      });
    }

    // Xóa thương hiệu nếu không có đồng hồ liên kết
    await Brand.findByIdAndDelete(req.params.id);
    // brand.save();
    return res
      .status(204)
      .json({ data: { brand: null }, message: "Brand deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

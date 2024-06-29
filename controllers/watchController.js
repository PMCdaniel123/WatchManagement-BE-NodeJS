const Watch = require("../models/Watch");
const Brand = require("../models/Brand");

exports.getAllWatches = async (_, res) => {
  try {
    const watches = await Watch.find({}).populate("brand", "brandName");
    return res.json({ data: { watches: watches } });
  } catch (err) {
    return res.status(400).json({ message: err.message, error: "Bad Request" });
  }
};

exports.getWatchById = async (req, res) => {
  try {
    const watch = await Watch.findById(req.params.id)
      .populate("brand", "brandName")
      .populate("comments.author", "membername");
    if (watch) {
      return res.json({
        data: {
          watch: watch,
        },
      });
    } else {
      return res
        .status(404)
        .json({ message: "Watch not found", error: "Not Found" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message, error: "Bad Request" });
  }
};

exports.getWatchByIdAdmin = async (req, res) => {
  try {
    const watch = await Watch.findById(req.params.id)
      .populate("brand", "brandName")
      .populate("comments.author", "membername");
    if (watch) {
      return res.json({
        data: {
          watch: watch,
        },
      });
    } else {
      return res
        .status(404)
        .json({ message: "Watch not found", error: "Not Found" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message, error: "Bad Request" });
  }
};

exports.createWatch = async (req, res) => {
  const { watchName, image, price, Automatic, watchDescription, brand } =
    req.body;
  try {
    const watch = new Watch({
      watchName,
      image,
      price,
      Automatic,
      watchDescription,
      brand,
    });
    await watch.save();
    return res.status(201).json({
      data: {
        watch: watch,
      },
      message: "Watch created",
    });
  } catch (err) {
    return res.status(400).json({ message: err.message, error: "Bad Request" });
  }
};

exports.updateWatch = async (req, res) => {
  const { watchName, image, price, Automatic, watchDescription, brand } =
    req.body;
  try {
    const watch = await Watch.findById(req.params.id);
    if (watch) {
      watch.watchName = watchName || watch.watchName;
      watch.image = image || watch.image;
      watch.price = price || watch.price;
      watch.Automatic = Automatic || watch.Automatic;
      watch.watchDescription = watchDescription || watch.watchDescription;
      watch.brand = brand || watch.brand;
      await watch.save();
      return res.status(201).json({
        data: {
          watch: {
            watchName: watchName,
            image: image,
            price: price,
            Automatic: Automatic,
            watchDescription: watchDescription,
            brand: brand,
          },
        },
        message: "Watch updated",
      });
    } else {
      return res
        .status(404)
        .json({ message: "Watch not found", error: "Not Found" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message, error: "Bad Request" });
  }
};

exports.deleteWatch = async (req, res) => {
  try {
    const watch = await Watch.findById(req.params.id);
    if (watch) {
      await Watch.findByIdAndDelete(req.params.id);
      return res.status(204).json({ data: null, message: "Watch deleted" });
    } else {
      return res
        .status(404)
        .json({ message: "Watch not found", error: "Not Found" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message, error: "Bad Request" });
  }
};

exports.searchAndFilterWatches = async (req, res) => {
  const { watchName, brandNames } = req.query;
  let searchCriteria = {};
  if (watchName) {
    searchCriteria.watchName = { $regex: watchName, $options: "i" };
  }
  if (brandNames) {
    const brandNameArray = brandNames.split("-").map((name) => name.trim());
    try {
      const brands = await Brand.find({
        brandName: { $in: brandNameArray.map((name) => new RegExp(name, "i")) },
      });
      if (brands.length === 0) {
        return res
          .status(404)
          .json({ message: "Brands not found", error: "Not Found" });
      }
      const brandIds = brands.map((brand) => brand._id);
      searchCriteria.brand = { $in: brandIds };
    } catch (err) {
      return res
        .status(400)
        .json({ message: err.message, error: "Bad Request" });
    }
  }
}

// Handle comments
exports.addComment = async (req, res) => {
  const { rating, content } = req.body;
  try {
    const watch = await Watch.findById(req.params.id);
    if (!watch) {
      return res
        .status(404)
        .json({ message: "Watch not found", error: "Not Found" });
    }

    // Check if the member has already commented on this watch
    const existingComment = watch.comments.find(
      (comment) => comment.author.toString() === req.member._id.toString(),
    );
    if (existingComment) {
      return res.status(400).json({
        message: "You have already commented on this watch",
        error: "Bad Request",
      });
    }

    const comment = { rating, content, author: req.member._id };
    watch.comments.push(comment);
    await watch.save();
    return res.status(201).json({
      data: {
        comment: comment,
      },
      message: "Comment added",
    });
  } catch (err) {
    return res.status(400).json({ message: err.message, error: "Bad Request" });
  }
};

exports.updateComment = async (req, res) => {
  const { rating, content } = req.body;
  try {
    // Find watch by ID
    const watch = await Watch.findById(req.params.id);
    if (!watch) {
      return res
        .status(404)
        .json({ message: "Watch not found", error: "Not Found" });
    }

    // Find comments in arr comments of the watch
    const comment = watch.comments.id(req.params.commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ message: "Comment not found", error: "Not Found" });
    }

    // Check if the member is the author of the comment
    if (comment.author.toString() !== req.member._id.toString()) {
      return res.status(403).json({ message: "Forbidden", error: "Forbidden" });
    }

    // Updated comment
    comment.rating = rating;
    comment.content = content;
    await watch.save();

    return res.status(200).json({
      data: { comment },
      message: "Comment updated",
    });
  } catch (err) {
    return res.status(400).json({ message: err.message, error: "Bad Request" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    // Find watch by ID
    const watch = await Watch.findById(req.params.id);
    if (!watch) {
      return res
        .status(404)
        .json({ message: "Watch not found", error: "Not Found" });
    }

    // Find comments in arr comments of the watch
    const comment = watch.comments.id(req.params.commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ message: "Comment not found", error: "Not Found" });
    }

    // Check if the member is the author of the comment
    if (comment.author.toString() !== req.member._id.toString()) {
      return res.status(403).json({ message: "Forbidden", error: "Forbidden" });
    }

    // Deleted comment
    watch.comments.pull(comment._id);
    await watch.save();

    return res.status(204).json({
      data: { comment: null },
      message: "Comment deleted",
    });
  } catch (err) {
    return res.status(400).json({ message: err.message, error: "Bad Request" });
  }
};

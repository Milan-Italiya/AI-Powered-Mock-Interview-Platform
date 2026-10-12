const errorMiddleware = (error, req, res, next) => {
    console.error("Error: ", error);

    return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error"
    })
}

export default errorMiddleware;
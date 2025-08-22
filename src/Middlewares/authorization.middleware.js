export const authorizationMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    const { role } = req.loggedInUser; 

    if (!role) {
      return res.status(401).json({ message: "User role not found" });
    }

    if (allowedRoles.includes(role)) {
      return next();
    }

    return res.status(401).json({ message: "Unauthorized" });
  };
};

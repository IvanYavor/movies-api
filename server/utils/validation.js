const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const validateCreateMovie = ({ title, year, format }) => {
  if (title.trim() === "") return false;

  if (year < 1850 || year > new Date().getFullYear()) {
    return false;
  }

  if (!["VHS", "DVD", "Blu-Ray"].includes(format)) {
    return false;
  }

  return true;
};

const validateUpdateMovie = ({ title, year, format }) => {
  if (title && title.trim() === "") return false;

  if (year && (year < 1850 || year > new Date().getFullYear())) {
    return false;
  }

  if (format && !["VHS", "DVD", "Blu-Ray"].includes(format)) {
    return false;
  }

  return true;
};

module.exports = {
  validateEmail,
  validateCreateMovie,
  validateUpdateMovie,
};

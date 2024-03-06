const asynchandler = (func) => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((err) => {
      next(err);
      console.log(`asynhandler error ${err}`);
    });
  };
};

export default asynchandler;

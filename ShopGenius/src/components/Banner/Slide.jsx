import PropTypes from "prop-types"; // ES6


const Slide = ({ bannerImg }) => {
  return (
    <>
      {/* <Container> */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div> */}
      <div
        className="h-[calc(100vh-72px)] lg:py-16 bg-no-repeat bg-cover bg-center lg:bg-top"
        style={{ backgroundImage: `url(${bannerImg})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>
      </div>
      {/* </Container> */}
    </>
  );
};

Slide.propTypes = {
  bannerImg: PropTypes.string,
  btnText: PropTypes.string,
  bannerDescription: PropTypes.string,
};
export default Slide;

import React from "react";
import PropTypes from "prop-types";
import { truncateAddress } from "../../utils";
const Address = ({ address }) => {
  if (address) {
    return (
      <button type="button" className="secondary-btn">
        {truncateAddress(address)}
      </button>
    );
  }

  return null;
};

Address.propTypes = {
  address: PropTypes.string,
};

Address.defaultProps = {
  address: "",
};

export default Address;

import React from "react";
import Button from "react-bootstrap/Button";

export function AwardNFTButton({action}){
  return (
    <Button variant="primary" onClick={action} />
  );
}

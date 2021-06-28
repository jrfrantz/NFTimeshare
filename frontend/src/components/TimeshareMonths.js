import React from "react";
import Container from "react-bootstrap/Container";
import {TimeshareMonth} from "./TimeshareMonth";

// Represents a grid of TimeshareMonth cards
export function TimeshareMonths({monthList}) {
  return(
     <Container key="1">
      {
        monthList.map ( (month, index) => {
          return (<TimeshareMonth asset={month} key={month.id}/>)
        })
      }
     </Container>
  );
}

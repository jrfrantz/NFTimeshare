import React from "react";
import Card from "react-bootstrap/Card";


// Card for a single TimeshareMonth NFT
export function TimeshareMonth({asset}) {
  return(
    <Card style={{ width: '18rem' }}>
      <Card.Header>Month Name </Card.Header>
      <Card.Img variant="top" src={asset.image_thumbnail_url}/>
      <Card.Link href={asset.permalink}>View on Opensea</Card.Link>
      {
        // TODO display month from asset.traits.month
      }
    </Card>
  );
}

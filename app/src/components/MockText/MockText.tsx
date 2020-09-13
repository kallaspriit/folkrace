import React, { useState } from "react";
import { P } from "../Paragraph/Paragraph";

export const MockText: React.FC = () => {
  const [paragraphCount, setParagraphCount] = useState(5);

  return (
    <>
      {Array(paragraphCount)
        .fill(null)
        .map((_, index) => (
          <P key={index} onClick={() => setParagraphCount(paragraphCount < 5 ? paragraphCount + 1 : 1)}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas blandit mattis nibh in imperdiet. Sed a
            volutpat nisi. Mauris ullamcorper pellentesque enim, in pretium nibh sagittis ut. Nam pharetra pulvinar urna
            sit amet interdum. Phasellus tortor elit, efficitur ut justo nec, varius fermentum leo. In vitae arcu vitae
            tellus ultrices luctus ut at ante. Proin commodo odio eu sollicitudin egestas. Cras rutrum mattis augue et
            fringilla.
          </P>
        ))}
    </>
  );
};

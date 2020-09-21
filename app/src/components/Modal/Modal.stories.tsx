import { action } from "@storybook/addon-actions";
import { withKnobs, boolean } from "@storybook/addon-knobs";
import React, { useState } from "react";
import { P } from "../Paragraph/Paragraph";
import { Modal, ModalBody, ModalActions, ModalButton } from "./Modal";

export default {
  title: "Modal",
  component: Modal,
  decorators: [withKnobs],
};

export const Default = () => (
  <Modal open={boolean("open", true)}>
    <ModalBody>Hello</ModalBody>
  </Modal>
);

export const WithFullScreen = () => (
  <Modal open={boolean("open", true)} fullscreen>
    <ModalBody>
      <P center>Hello</P>
    </ModalBody>
  </Modal>
);

export const WithFullScreenTitle = () => (
  <Modal open={boolean("open", true)} fullscreen>
    <ModalBody title="Loved free Session?">
      <P center>Would you like to unlock all the Sessions and get the full experience?</P>
    </ModalBody>
    <ModalActions>
      <ModalButton>Cancel</ModalButton>
      <ModalButton>Next</ModalButton>
    </ModalActions>
  </Modal>
);

export const WithActions = () => (
  <Modal open={boolean("open", true)}>
    <ModalBody>
      <P center>Would you like to unlock all the Sessions and get the full experience?</P>
    </ModalBody>
    <ModalActions>
      <ModalButton>Cancel</ModalButton>
      <ModalButton>Next</ModalButton>
    </ModalActions>
  </Modal>
);

export const WithClickOutside = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <Modal open={showModal} onClickOutside={() => setShowModal(false)}>
      <ModalBody>
        <P center>Would you like to unlock all the Sessions and get the full experience?</P>
      </ModalBody>
      <ModalActions>
        <ModalButton onClick={() => alert("Clicked cancel")}>Cancel</ModalButton>
        <ModalButton highlighted onClick={() => alert("Clicked next")}>
          Next
        </ModalButton>
      </ModalActions>
    </Modal>
  );
};

export const WithSingleAction = () => (
  <Modal open={boolean("open", true)}>
    <ModalBody>
      <P center>Would you like to unlock all the Sessions and get the full experience?</P>
    </ModalBody>
    <ModalActions>
      <ModalButton>Cancel</ModalButton>
    </ModalActions>
  </Modal>
);

export const WithMoreThanTwoActions = () => (
  <Modal open={boolean("open", true)}>
    <ModalBody>
      <P center>Would you like to unlock all the Sessions and get the full experience?</P>
    </ModalBody>
    <ModalActions>
      <ModalButton>Cancel</ModalButton>
      <ModalButton>Pay instantly</ModalButton>
      <ModalButton>Next</ModalButton>
    </ModalActions>
  </Modal>
);

export const WithBackdrop = () => (
  <Modal open={boolean("open", true)} backdrop={boolean("backdrop", true)}>
    <ModalBody>
      <P center>Would you like to unlock all the Sessions and get the full experience?</P>
    </ModalBody>
    <ModalActions>
      <ModalButton>Cancel</ModalButton>
      <ModalButton>Next</ModalButton>
    </ModalActions>
  </Modal>
);

export const WithHighlightedAction = () => (
  <Modal open={boolean("open", true)} backdrop={boolean("backdrop", true)}>
    <ModalBody>
      <P center>Would you like to unlock all the Sessions and get the full experience?</P>
    </ModalBody>
    <ModalActions>
      <ModalButton highlighted>Cancel</ModalButton>
      <ModalButton>Next</ModalButton>
    </ModalActions>
  </Modal>
);

export const WithoutPadding = () => (
  <Modal open={boolean("open", true)}>
    <ModalBody withoutPadding>
      <P center>Would you like to unlock all the Sessions and get the full experience?</P>
    </ModalBody>
  </Modal>
);

export const WithTitleAndContent = () => (
  <Modal open={boolean("open", true)}>
    <ModalBody title="Loved free sessions?">
      <P center>Would you like to unlock all the Sessions and get the full experience?</P>
    </ModalBody>
    <ModalActions>
      <ModalButton>Cancel</ModalButton>
      <ModalButton>Next</ModalButton>
    </ModalActions>
  </Modal>
);

export const WithCallback = () => (
  <Modal open={boolean("open", true)}>
    <ModalBody title="Loved free sessions?">
      <P center>Would you like to unlock all the Sessions and get the full experience?</P>
    </ModalBody>
    <ModalActions>
      <ModalButton onClick={action("clicked cancel")}>Cancel</ModalButton>
      <ModalButton onClick={action("clicked next")}>Next</ModalButton>
    </ModalActions>
  </Modal>
);

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "row",
};

export default function BasicModal(props) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const cantClose = () => {
    return;
  };

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  return (
    <div>
      {props.button && <Button onClick={handleOpen}>Open modal</Button>}
      <Modal
        open={open}
        onClose={props.canClose ? handleClose : cantClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              {props.heading}
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              {props.body}
            </Typography>
          </div>
          {props.status === "prog" && <CircularProgress />}
          {props.status === "done" && (
            <CheckCircleIcon fontSize="large" color="success" />
          )}
        </Box>
      </Modal>
    </div>
  );
}

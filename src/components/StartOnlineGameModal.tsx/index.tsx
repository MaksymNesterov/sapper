import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import { FC } from "react";
import { Box, Stack } from "@mui/material";

interface Props {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
}

export const StartOnlineGameModal: FC<Props> = ({
  isOpen,
  onClose,
  onAccept,
  onDecline,
}) => {
  return (
    <Dialog onClose={() => onClose(false)} open={isOpen}>
      <DialogTitle>You have been invited</DialogTitle>
      <Stack paddingX={'24px'} spacing={1}>
        <Typography>You have been invited to the Online game</Typography>
        <Box justifyContent="space-around" display='flex' alignContent={'center'}>
          <Button onClick={onAccept}>Accept</Button>
          <Button onClick={onDecline}>Decline</Button>
        </Box>
      </Stack>
    </Dialog>
  );
};

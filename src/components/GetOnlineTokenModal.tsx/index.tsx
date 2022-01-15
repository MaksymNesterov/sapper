import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import { FC, useState } from "react";
import { TextField, Button, Stack, styled, Box } from "@mui/material";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { token } from "utils";

interface Props {
  isOpen: boolean;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
	handleConnect: (inputValue: string) => void;
}

const CustomTypography = styled(Typography)(() => ({
  cursor: "pointer",
}));

export const GetOnlineTokenModal: FC<Props> = ({
  isOpen,
  onClose,
	handleConnect
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  return (
    <Dialog onClose={() => onClose(false)} open={isOpen}>
      <DialogTitle>Online token</DialogTitle>
      <Stack spacing={1}>
        <CustomTypography
          onClick={() => navigator.clipboard.writeText(token)}
          padding={"0px 24px"}
        >
          Your online token is: <b>{token}</b>
          <br />
          Share it with your opponent.{" "}
          <small>(click to copy to clipboard)</small>
        </CustomTypography>
      </Stack>
      <DialogTitle>Connect to player</DialogTitle>
      <Stack spacing={1}>
        <Box padding={"0px 24px"}>
          <TextField
            style={{ width: "100%" }}
            label="User token"
            variant="outlined"
            value={inputValue}
            type="string"
            onChange={(event) => setInputValue(event.currentTarget.value)}
          />
        </Box>
        <Button
          variant="contained"
          disabled={!inputValue}
          onClick={() => handleConnect(inputValue)}
        >
          Connect
        </Button>
      </Stack>
    </Dialog>
  );
};

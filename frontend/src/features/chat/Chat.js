import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  CardActions,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { appendLog, selectLogs } from "./chatSlice";
import { io } from "socket.io-client";

const useStyles = makeStyles({
  sendButton: {
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
  },
  chatCard: {
    width: "100vw",
    minHeight: "100vh",
    maxHeight: "100vh",
  },
  dialogSection: {
    minHeight: "83vh",
    maxHeight: "83vh",
    overflowY: "scroll",
  },
  inputSection: {
    padding: "0 0 0 0",
    minHeight: "17vh",
    maxHeight: "17vh",
  },
});

const socket = io({ path: "/socket" });
console.log(socket);
socket.on("connect", () => {
  console.log("socket connected");
});

export function Chat() {
  const classes = useStyles();
  const logs = useSelector(selectLogs);
  const dispatch = useDispatch();
  const [inputMessage, setInputMessage] = useState("");
  const handleInputMessageChange = (event) => {
    setInputMessage(event.target.value);
  };
  const handleSubmit = (event) => {
    dispatch(appendLog(`sent: ${inputMessage}`));
    socket.emit("chat", inputMessage);
    setInputMessage("");
    event.preventDefault();
  };
  useEffect(() => {
    socket.on("chat", (message) => {
      console.log(`received: ${message}`);
      dispatch(appendLog(`received: ${message}`));
    });
  }, [dispatch]);
  return (
    <Card className={classes.chatCard}>
      <CardContent className={classes.dialogSection}>
        <Grid item xs={12}>
          <List>
            {logs.map((log, index) => (
              <ListItem key={index}>
                <Grid container>
                  <Grid item xs={12}>
                    <ListItemText
                      align={log.includes("sent") ? "right" : "left"}
                      primary={log}
                    ></ListItemText>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        </Grid>
      </CardContent>
      <CardActions className={classes.inputSection}>
        <Grid container>
          <Grid item xs={12}>
            <form noValidate autoComplete="off" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="메시지"
                variant="outlined"
                color="#02feff"
                size="normal"
                value={inputMessage}
                onChange={handleInputMessageChange}
              />
            </form>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
}

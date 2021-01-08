import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  CardActions,
  Grid,
  Paper,
  Text,
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
    height: "83vh",
    overflowY: "auto",
  },
  inputSection: {
    padding: "0 0 0 0",
    minHeight: "17vh",
    maxHeight: "17vh",
  },
  usernameMine: {
    color: "black",
    fontSize: "14px",
    textAlign: "right",
    marginRight: "10px",
  },
  usernameOthers: {
    color: "black",
    fontSize: "14px",
    textAlign: "left",
    marginLeft: "10px",
  },
  msgMine: {
    border: "1px solid #4267b2",
    padding: "7px 15px",
    borderRadius: "15px",
    fontSize: "15px",
    color: "white",
    background: "#4267b2",
    marginBottom: "20px",
    float: "right",
    maxWidth: "55%",
    wordBreak: "break-all",
    fontWeight: "bold",
    textAlign: "right",
  },
  msgOthers: {
    border: "1px solid #dfe6e9",
    padding: "7px 15px",
    borderRadius: "15px",
    fontSize: "15px",
    background: "#dfe6e9",
    marginBottom: "20px",
    float: "left",
    maxWidth: "55%",
    wordBreak: "break-all",
    textAlign: "left",
  },
});

const socket = io({ path: "/socket" });
console.log(socket);
socket.on("connect", () => {
  console.log("socket connected");
});

export function Chat() {
  const messageEl = useRef(null);
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
  useEffect(() => {
    if (messageEl) {
      console.log(messageEl);
      messageEl.current.addEventListener("DOMNodeInserted", (event) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: "smooth" });
      });
    }
  }, []);
  return (
    <Card className={classes.chatCard}>
      <CardContent className={classes.dialogSection} ref={messageEl}>
        {logs.map((log, index) => (
          <Grid container>
            <Grid
              direction="column"
              alignItems={log.includes("sent") ? "flex-end" : "flex-start"}
              xs={12}
            >
              <div
                className={
                  log.includes("sent")
                    ? classes.usernameMine
                    : classes.usernameOthers
                }
              >
                username
              </div>
              <Paper
                key={index}
                className={
                  log.includes("sent") ? classes.msgMine : classes.msgOthers
                }
                elevation={0}
              >
                {log}
              </Paper>
            </Grid>
          </Grid>
        ))}
      </CardContent>
      <CardActions className={classes.inputSection}>
        <Grid container>
          <Grid item xs={12}>
            <form noValidate autoComplete="off" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="메시지"
                variant="outlined"
                size="medium"
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

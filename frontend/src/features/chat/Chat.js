import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  CardActions,
  Grid,
  Paper,
  Snackbar,
  TextField,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import { appendLog, selectLogs } from "./chatSlice";
import { io } from "socket.io-client";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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
  const [open, setOpen] = React.useState(false);
  const handleClick = () => {
    setOpen(true);
  };
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  const [alertMessage, setAlertMessage] = React.useState("");
  const [typing, setTyping] = useState([]);
  const [username, setUsername] = useState(
    Math.random().toString(36).substr(2, 11)
  );
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  const [inputMessage, setInputMessage] = useState("");
  const handleInputMessageChange = (event) => {
    setInputMessage(event.target.value);
  };
  const handleSubmit = (event) => {
    const payload = { username: username, message: inputMessage };
    if (inputMessage !== "") {
      dispatch(appendLog(payload));
      socket.emit("typing done", payload);
      socket.emit("chat", payload);
      setInputMessage("");
    }
    event.preventDefault();
  };
  useEffect(() => {
    socket.on("dududunga", (payload) => {
      console.log(`${payload.username} dududunga!`);
      setAlertMessage(`${payload.username} dududunga!`);
      setOpen(true);
    });
    socket.on("typing yet", (payload) => {
      console.log(`${payload.username} is typing yet`);
      if (!typing.includes(payload.username)) {
        setTyping([...typing, payload.username]);
      }
    });
    socket.on("typing done", (payload) => {
      console.log(`${payload.username} is typing done`);
      setTyping(typing.filter((_username) => _username !== payload.username));
    });
    socket.on("chat", (payload) => {
      console.log(`${payload.username} sent: ${payload.message}`);
      dispatch(appendLog(payload));
    });
    socket.emit("set user", { username: username });
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
  useEffect(() => {
    const payload = { username: username };
    const timeoutId = setTimeout(
      () => socket.emit("typing done", payload),
      1000
    );
    return () => {
      socket.emit("typing yet", payload);
      clearTimeout(timeoutId);
    };
  }, [inputMessage]);
  return (
    <Card className={classes.chatCard}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="info">
          {alertMessage}
        </Alert>
      </Snackbar>
      <CardContent className={classes.dialogSection} ref={messageEl}>
        {logs.map((log, index) => (
          <Grid container>
            <Grid
              direction="column"
              alignItems={log.username === username ? "flex-end" : "flex-start"}
              xs={12}
            >
              <div
                className={
                  log.username === username
                    ? classes.usernameMine
                    : classes.usernameOthers
                }
              >
                {log.username}
              </div>
              <Paper
                key={index}
                className={
                  log.username === username
                    ? classes.msgMine
                    : classes.msgOthers
                }
                elevation={0}
              >
                {log.message}
              </Paper>
            </Grid>
          </Grid>
        ))}
      </CardContent>
      <CardActions className={classes.inputSection}>
        <Grid direction="column" xs={12}>
          <Grid item xs={12} style={{ fontSize: "12px" }}>
            {typing.length > 0
              ? `${typing.join(", ")}이(가) 입력 중입니다...`
              : "Bleeding-edge chat"}
          </Grid>
          <Grid container>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="이름"
                variant="outlined"
                size="small"
                value={username}
                onChange={handleUsernameChange}
              />
            </Grid>
            <Grid item xs={9}>
              <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <TextField
                  autoFocus
                  fullWidth
                  label="메시지"
                  variant="outlined"
                  size="small"
                  value={inputMessage}
                  onChange={handleInputMessageChange}
                />
              </form>
            </Grid>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
}

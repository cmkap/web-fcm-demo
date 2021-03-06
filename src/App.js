import React, { useState } from "react";
import FaceCapture from "@getyoti/react-face-capture";
import "@getyoti/react-face-capture/index.css";
import Container from "@material-ui/core/Container";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Button, Zoom, CircularProgress, Grid } from "@material-ui/core";
import ReplayIcon from "@material-ui/icons/Replay";
import { Api } from "./api/api";
import RadioButtons from "./components/RadioButtons";
import SecureField from "./components/SecureField";
import clsx from "clsx";

const service = new Api();

const useStyles = makeStyles((theme) =>
  createStyles({
    root: { paddingTop: theme.spacing(3) },
    img: { width: "100%", borderRadius: 20 },
    imgContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "50vw",
      margin: "auto",
    },
    button: {
      marginTop: theme.spacing(3),
    },
    scanContainer: {
      width: "50vw",
      marginLeft: "auto",
      marginRight: "auto",
    },
    faceCaptureWrapper: {
      borderRadius: 20,
      overflow: "hidden",
    },
    options: {
      marginTop: "15px",
      paddingTop: "15px",
      border: "2px solid",
      borderColor: theme.palette.primary.main,
      borderRadius: 20,
    },
    response: {
      marginTop: theme.spacing(2),
      minHeight: "180px",
      border: "2px solid",
      borderColor: theme.palette.primary.main,
      borderRadius: 20,
      minWidth: "80%",
      padding: theme.spacing(1),
    },
    error: { borderColor: theme.palette.error.main },
    responseTitle: {
      fontWeight: theme.typography.fontWeightBold,
      color: theme.palette.primary.main,
    },
    responseTitleError: {
      color: theme.palette.error.main,
    },
  })
);

const assuranceLevels = ["low", "medium", "high"];

const App = () => {
  const [image, setImage] = useState();
  const [levelOfAssurance, setLevelOfAssurance] = useState("");
  const [secureFlag, setSecureFlag] = useState(false);
  const [response, setResponse] = useState();
  const [error, setError] = useState();

  const classes = useStyles();

  const onSuccess = ({ img, secure }) => {
    setImage(img);
    const fcmResponse = { img, secure };
    service
      .predict({
        ...fcmResponse,
        level_of_assurance: levelOfAssurance || undefined,
      })
      .then((res) => setResponse(JSON.stringify(res.data.age.age < 18 ? "Access Denied" : `Estimated Age:${res.data.age.age} Access Granted`, null, 2)))
      .catch((err) => {
        setError(true);
        const errorMessage = err.response.data;
        setResponse(
          typeof errorMessage === "object" && errorMessage !== null
            ? JSON.stringify(errorMessage, null, 2)
            : errorMessage
        );
      });
  };
  const onError = (error) => console.log("Error =", error);

  const onLevelOfAssuranceChange = (event) => {
    if (event.target.value) {
      setLevelOfAssurance(
        event.target.value !== levelOfAssurance ? event.target.value : ""
      );
    }
  };

  const reset = () => {
    setImage(undefined);
    setResponse(undefined);
    setError(undefined);
  };

  return (
    <div className={classes.root}>
      <Container>
        {!image ? (
          <div className={classes.scanContainer}>
            <div className={classes.faceCaptureWrapper}>
              <FaceCapture
                onSuccess={onSuccess}
                onError={onError}
                secure={secureFlag}
              />
            </div>

            <Grid
              container
              spacing={1}
              justifyContent={"space-evenly"}
              className={classes.options}
            >
              <Grid item xs={8} sm={4}>
                <SecureField
                  currentValue={secureFlag}
                  onChange={setSecureFlag}
                />
              </Grid>
              <Grid item xs={8} sm={4}>
                <RadioButtons
                  label="Level of assurance"
                  currentValue={levelOfAssurance}
                  values={assuranceLevels}
                  onClick={onLevelOfAssuranceChange}
                />
              </Grid>
            </Grid>
          </div>
        ) : (
          <div className={classes.imgContainer}>
            <Zoom in={!!image}>
              <img
                className={classes.img}
                src={image}
                alt="Face Capture Module"
              />
            </Zoom>
            <div
              className={clsx(classes.response, {
                [classes.error]: error,
              })}
            >
              {response ? (
                <>
                  <span
                    className={clsx(classes.responseTitle, {
                      [classes.responseTitleError]: error,
                    })}
                  >
                    {error ? "Error" : "Response"}:
                  </span>
                  <pre>{response}</pre>
                </>
              ) : (
                <CircularProgress size={30} />
              )}
            </div>
            <Button
              variant="contained"
              color="primary"
              size="large"
              className={classes.button}
              onClick={reset}
              endIcon={<ReplayIcon />}
            >
              Restart
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default App;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone'

import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { GoogleLogin } from 'react-google-login';
import FileViewer from 'react-file-viewer-extended';
    
import useStyles from "./styles";
import { GoogleIcon } from 'infrastructure/assets/img/GoogleIcon';
import { DriveIcon } from 'infrastructure/assets/img/DriveIcon'
import Alert from '../Alerts/Alert';
import Alerts, { IAlerts } from 'infrastructure/components/Alerts/AlertsComponent';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Paper from "@material-ui/core/Paper";
import Typography from '@material-ui/core/Typography';

var  SCOPE  =  'https://www.googleapis.com/auth/drive.file';
var  discoveryUrl  =  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

const path = require('path');

const API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID;
// const SERVER = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://manuelgc.eu/nodejs"
const SERVER = "https://manuelgc.eu/nodejs";
const UPLOADS = "https://manuelgc.eu/uploads";
const maxLength = 250 * 1024;

const Main = (props: any) => {
    const classes = useStyles();
    // const [Dropdown, RenderedAlerts, createAlerts] = useAlerts();
    const [googleAuth, setGoogleAuth] = useState<gapi.auth2.GoogleAuth>();
    const [userProfile, setUserProfile] = useState<gapi.auth2.BasicProfile>();
    // const [alerts, setAlerts] = useState<Alert[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isReady, setReady] = useState(false);
    
    //  To use a state property inside of a setTimeout
    // const alertsRef = useRef(alerts);
    // alertsRef.current = alerts;

    /////////////////////////////////////
    //
    // Alerts
    //

    // type AlertsRefHandle = React.ElementRef<typeof Alerts>;
    const alertsRef = useRef<IAlerts>(null);
    
        /* const Alerts = forwardRef((props: IRenderedAlerts, ref) => {
        const { className } = props;
        const [ alerts, setAlerts ] = useState<Alert[]>([]);
        
        useImperativeHandle(ref, () => ({
            createAlerts: (newAlerts: Alert[]) => {

                // const alert = {
                //     id: uuidv4(),
                //     type: type,
                //     title: title,
                //     msg: <>{msg}</>,
                //     isShowed: false
                // };
console.log("CA", alerts.length, newAlerts.length)        
                setAlerts([...alerts, ...newAlerts]);
            },
            getAlert() {
              alert("getAlert from Child");
            }
        
          }));
        
        return (
            <Container className={className}>
                {alerts.map((alert: Alert) => {
console.log("RA", alert.isShowed)
                    return (alert.isShowed &&
                        <MuiAlert className={"alertComponent"} 
                            key={alert.id} 
                            // onClose={() => deleteAlert(alert.id)} 
                            severity={alert.type}>
                            <MuiAlertTitle>{alert.title}</MuiAlertTitle>
                            {alert.msg}
                        </MuiAlert>
                    )
                })}
            </Container>
        )
    }); */

    /* const deleteAlert = (id: string) => {
        const idx = alerts.findIndex(e => e.id === id);

        if (idx < 0)
            return;
        alerts.splice(idx, 1);
        setAlerts([...alerts]);
    }

    useEffect(() => {

        if (!alerts.length)
            return;
console.log("UE")
        const addInterval = setInterval(() => {
            const idx = alerts.findIndex(v => !v.isShowed)
            if (idx >= 0)
                alerts[idx].showed=true;
            setAlerts([...alerts])
        }, 700);

        //const time = 6000 / alerts.length;
        // const time = 6000;
        // const interval = setInterval(() => {
        //     console.log("DEL", alerts.length, alerts[0].id, time)
        //     deleteAlert(alerts[0].id);
        // }, time);
        
        return () => {
            clearInterval(addInterval);
            // clearInterval(interval)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alerts]); */

    //
    // Alerts
    //
    /////////////////////////////////////

    /////////////////////////////////////
    //
    // Google
    //

    const updateSignStatus = async () => {
        if (!googleAuth)
            return;
        const user = googleAuth.currentUser.get();
        const newUserProfile = user.getBasicProfile();
        const isAuthorized = user.hasGrantedScopes(SCOPE);
        if (!newUserProfile) {
            setUserProfile(undefined);
            return
        }
        if (isAuthorized) {
            setUserProfile(newUserProfile);
            //we will put the code of the third step here
        }
    }

    const signInFunction = () => {
        googleAuth?.signIn()
        .then(() => updateSignStatus())
        .catch(err => console.log("SIGNIN ERROR", err));
    }

    const signOutFunction = (force: boolean = true) => {
        if (!force) {
            const result = window.confirm("?? Desea cerrar la sesi??n ?");
            if (!result)
                return;
        }
        googleAuth?.signOut();
        setUserProfile(undefined);
    }

    const sendFile = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, fileName: string) => {
        e.stopPropagation();

        const result = window.confirm("?? Desea subir el archivo al Drive ?");
        if (!result)
            return;

        axios.get<Blob>(SERVER + "/upload/" + fileName, { responseType: 'blob' })
        .then(async res => {
            const metadata = {
                'name': fileName, // Filename at Google Drive
                'mimeType': res.headers["content-type"], // mimeType at Google Drive
                // 'parents': ['### folder ID ###'], // Folder ID at Google Drive
            };
    
            var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
            var form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', res.data);
    
            fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
                body: form,
            }).then((res) => {
                return res.json();
            }).then(val => {
                const alert = new Alert("success", fileName, ["Enviado al Drive"]);
                alertsRef.current?.createAlerts([alert]);
            }).catch(err => {
                const alert = new Alert("error", fileName, ["No se ha podido Enviar al Drive"]);
                alertsRef.current?.createAlerts([alert]);
            });
        });
    }

    const responseGoogle = (response: any) => {
        let alert: Alert;
        if (response.error) {
            alert = new Alert("error", "Google Authentication Error", [response.details || ""])
        } else {
            alert = new Alert("success", "Google Authentication Success");
            signInFunction();
        }

        // setAlerts([...alerts, alert]);
        alertsRef.current?.createAlerts([alert])
    }

    useEffect(() => {
        if(googleAuth)
            return;
        const initClient = () => {
            try {
                window.gapi.client.init({
                    'apiKey': API_KEY,
                    'clientId': CLIENT_ID,
                    'scope': SCOPE,
                    'discoveryDocs': [discoveryUrl]
                }).then(() => {
                    const newGoogleAuth = window.gapi.auth2.getAuthInstance()
                    newGoogleAuth.isSignedIn.listen(updateSignStatus);
                    setGoogleAuth(newGoogleAuth)
                })
            } catch (e) {
                console.log(e);
            }
        }
        const handleClientLoad = () => {
            window.gapi.load('client:auth2', initClient);
        }
        const script = document.createElement('script');

        script.onload=handleClientLoad;
        script.src="https://apis.google.com/js/api.js";
        document.body.appendChild(script);
    })

    //
    // Google
    //
    /////////////////////////////////////

    /////////////////////////////////////
    //
    // Files
    //

    const fileSizeValidator = (file: File) => {
        if (file.size > maxLength) {
            return {
                code: "file-too-large",
                message: `File size is larger than 300k`
            };
        }
    
        return null
    }

    const {
        // acceptedFiles,
        fileRejections,
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        accept: 'application/vnd.ms-excel, text/plain, .txt, .csv, image/*',
        maxFiles: 3,
        validator: fileSizeValidator,
        onDrop: acceptedFiles => {
            setLoading(true);
            setFiles(acceptedFiles.map(file => {
// console.log("AF", file);
                onFileUpload(file)
                Object.assign(file, {
                    preview: URL.createObjectURL(file)
                })
                return file;
            }));
            getFiles();
            setLoading(false);
        }
    });
    
    const getFiles = () => {
        axios.get<any[]>(SERVER + "/upload")
        .then(res => {
            setFiles(res.data)
        })
        .catch(err => {
            setFiles([]);
            const alert = new Alert("error", err.toString()); 
            alertsRef.current?.createAlerts([alert]);
        });
    }

    const onFileUpload = (file: File) => {
        // Create an object of formData
        const formData = new FormData();

        // Update the formData object
        formData.append(
            "file",
            file,
            file.name
        );
        // Send formData object
        axios.post(SERVER + "/upload", formData)
        .then(res => {
            const alert = new Alert("success", file.name); 
            alertsRef.current?.createAlerts([alert]);
        })
        .catch(err => {
            const alert = new Alert("error", file.name, err.toString()); 
            alertsRef.current?.createAlerts([alert]);
        });
    };

    const deleteFile = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, file: string) => {
        e.stopPropagation();

        const result = window.confirm("?? Desea eliminar el archivo ?");
        if (!result)
            return;

        axios.delete(SERVER + "/upload/" + file)
        .then(res => {
            getFiles();
            const alert = new Alert("success", file + " eliminado"); 
            alertsRef.current?.createAlerts([alert]);
        })
        .catch(err => {
            const alert = new Alert("error", file, ["No se ha podido eliminar el archivo. " + err.toString()]); 
            alertsRef.current?.createAlerts([alert]);
        });
    };

    const viewFiles = files.map((file, i) => {
// console.log("VF", file.type, path.join(UPLOADS, file.name))
        return (
            <div className={classes.thumb} key={i}>
                <IconButton disabled={userProfile ? false : true} className={classes.driveBtn} onClick={(e) => sendFile(e, file.name)} aria-label="Google Drive">
                    <DriveIcon />
                </IconButton>
                <IconButton className={classes.removeBtn} onClick={(e) => deleteFile(e, file.name)} aria-label="delete">
                    <DeleteIcon />
                </IconButton>
                <div className={classes.thumbInner}>
                    <FileViewer
                        key={i}
                        fileType={file.type}
                        filePath={path.join(UPLOADS, file.name)}
                        unsupportedComponent={ () =>
                            <div className={classes.unsupportedComponent}>
                                <Typography variant="h4" className="text">{`${file.type ? file.type : '?' }`}</Typography>
                            </div>
                        }
                        onError={(err: any) => console.log("FileViewer", err)}
                    />
                </div>
                <Typography className={classes.thumbText} variant="body2">{file.name}</Typography>
            </div>
        )
    });

    useEffect(() => {
        const newAlerts: any[] = [];
        fileRejections.forEach(file  => {
            const alert = {
                id: uuidv4(),
                type: "error",
                title: file.file.name + " - " + file.file.size,
                msg: file.errors.map((e: any) => (
                    <li key={e.code}>{e.message}</li>
                ))
            }
            newAlerts.push(alert);
            
        });
        // setAlerts([...alerts, ...newAlerts])
        alertsRef.current?.createAlerts(newAlerts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[fileRejections])

    //
    // Files
    //
    /////////////////////////////////////

    /////////////////////////////////////
    //
    // Drag
    //

    const className = useMemo(() => [
        classes.dropBox,
        isDragActive ? classes.dropBoxActive : "",
        isDragAccept ? classes.dropBoxAccept : "",
        isDragReject ? classes.dropBoxReject : ""
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ].join(" "), [
        isDragActive,
        isDragReject,
        isDragAccept
    ]);
    const { ...rootProps } = getRootProps({className})

    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    //
    // Drag
    //
    /////////////////////////////////////

    useEffect(() => {
        // RESET
        const constructor = () => {
            getFiles();
            setUserProfile(undefined);
            signOutFunction();
            setGoogleAuth(undefined);
            var tags = document.getElementsByTagName('script');
            for (let i = tags.length; i >= 0; i--) { //search backwards within nodelist for matching elements to remove
                if (tags[i] && tags[i].getAttribute('src') != null && tags[i].getAttribute('src') === "https://apis.google.com/js/api.js") {
// console.log("DELETE SCRIPT");
                    tags[i].parentNode?.removeChild(tags[i]); //remove element by calling parentNode.removeChild()
                }
            }
            setReady(true);
        }
        if (!isReady)
            constructor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getFiles, googleAuth?.isSignedIn, isReady, userProfile])

    return (
        <div className={classes.root}>
            <Paper className={classes.dropBoxContainer}>
                <Card {...rootProps}>
                    <input {...getInputProps()} />
                    <p style={{paddingLeft: 16}}>Arrastra tus archivos aqu??,<br/> o clica para seleccionar ficheros,<br/> m??ximo 3 archivos a la vez y 250k</p>
                    {loading &&
                        <div className={classes.loadingError}>
                           <CircularProgress />
                            <Typography variant="h4">Cargando...</Typography>
                        </div>
                    }
                    {!loading &&
                        <aside className={classes.thumbsContainer}>
                            {viewFiles}
                        </aside>
                    }
                </Card>
                <Alerts className={classes.renderedAlerts}
                    ref={alertsRef}/>
                {/* <Dropdown className={classes.renderedAlerts}></Dropdown> */}
                {/* <RenderedAlerts className={classes.renderedAlerts}></RenderedAlerts> */}
                {/* <div style={{position: "absolute", bottom: 5, right: 50, overflowX: "hidden"}}>{RenderAlerts}</div> */}
            </Paper>
            <Paper className={classes.loginContainer}>
                {userProfile &&
                    <div className={classes.userImg}>
                        <img src={userProfile.getImageUrl()} alt={"Use"} onClick={() => signOutFunction(false)}></img>
                        <Typography>{userProfile.getName()}</Typography>
                        <Typography>{userProfile.getEmail()}</Typography>
                    </div>
                }
<Button onClick={() => {const newAlerts = []; for (let i = 0; i < 3; i++) newAlerts.push(new Alert("success", "T??tulo " + i, ["Mensaje", "Mensaje2"])); alertsRef.current?.createAlerts(newAlerts)}}>ALERTS</Button>                
                <Typography variant="h5">Bienvenido a DDrop</Typography>
                <Typography className={classes.loginParagraph} variant="subtitle2">Para subir tus archivos de forma simple a drive, puedes hacer Login a trav??s de Google.</Typography>
                <Divider className={classes.divider}></Divider>
                <GoogleLogin
                    clientId={CLIENT_ID || ""}
                    render={renderProps => (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={renderProps.onClick}
                            disabled={false} // {renderProps.disabled}
                            className={classes.button}
                            startIcon={<GoogleIcon />}
                        >
                            Login con Google
                        </Button>
                        // <button onClick={renderProps.onClick} disabled={renderProps.disabled}>This is my custom Google button</button>
                    )}
                    buttonText="Login"
                    onSuccess={responseGoogle}
                    //onFailure={responseGoogle}
                    cookiePolicy={'single_host_origin'}
                />,
            </Paper>
        </div>
    )
}

export default Main;

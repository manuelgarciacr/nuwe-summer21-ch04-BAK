import { forwardRef, Ref, useEffect, useImperativeHandle, useState } from "react";

import Alert from "./Alert";
import useStyles from "./styles";

import Container from "@material-ui/core/Container";
import MuiAlert from '@material-ui/lab/Alert';
import MuiAlertTitle from '@material-ui/lab/AlertTitle';

interface IProps {
    className?: string
}

export interface IAlerts {
    createAlerts: (newAlerts: Alert[]) => void
}

const Alerts = (props: IProps, ref: Ref<IAlerts> ) => {
    const classes = useStyles();
    const { className } = props;
    const [ alerts, setAlerts ] = useState<Alert[]>([]);

    useImperativeHandle(ref, () => ({ createAlerts }));
    
    const createAlerts = (newAlerts: Alert[]) => {
        setAlerts([...alerts, ...newAlerts]);
    }
      
    const deleteAlert = (id: number) => {
        alerts.splice(id, 1);
        setAlerts([...alerts])
    }

    useEffect(() => {
        if (!alerts.length)
            return;

        const idx = alerts.findIndex(v => !v.isShowed)
        if (idx >= 0) {
            const addTimeout = setTimeout(() => {
                alerts[idx].showed=true;
                setAlerts([...alerts]);
                clearTimeout(addTimeout)
            }, 700)
        }
    }, [alerts]);

    useEffect(() => {
        if (!alerts.length)
            return;

        const time = alerts[0].msg.length ? 3000 : 1500;
        const deleteInterval = setInterval(() => {
            if (alerts.length)
                deleteAlert(0);
        }, time);
    
        return () => {
            clearInterval(deleteInterval)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    });

    return (
        <Container className={`${className ? className : ""} ${classes.renderedAlerts}`}>
            {alerts.map((alert: Alert, idx: number) => {
                return (alert.isShowed &&
                    <MuiAlert className={"alertComponent"} 
                        key={alert.id} 
                        onClose={() => deleteAlert(idx)} 
                        severity={alert.type}>
                        <MuiAlertTitle>{alert.title}</MuiAlertTitle>
                        <ul>
                            {alert.msg.map((msg, i) => <li key={i}>{msg}</li>)}
                        </ul>
                    </MuiAlert>
                )
            })}
        </Container>
    )
}

export default forwardRef(Alerts);
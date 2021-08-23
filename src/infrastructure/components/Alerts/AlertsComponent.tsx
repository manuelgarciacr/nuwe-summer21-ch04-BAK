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
console.log("CA", alerts.length, newAlerts.length)
        setAlerts([...alerts, ...newAlerts]);
    }
      
    const deleteAlert = (id: number) => {
        alerts.splice(id, 1);
        setAlerts([...alerts])
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
    }, [alerts]);

    return (
        <Container className={`${className ? className : ""} ${classes.renderedAlerts}`}>
            {alerts.map((alert: Alert, idx: number) => {
console.log("RA", alert.isShowed)
                return (alert.isShowed &&
                    <MuiAlert className={"alertComponent"} 
                        key={alert.id} 
                        onClose={() => deleteAlert(idx)} 
                        severity={alert.type}>
                        <MuiAlertTitle>{alert.title}</MuiAlertTitle>
                        {alert.msg}
                    </MuiAlert>
                )
            })}
        </Container>
    )
}

export default forwardRef(Alerts);
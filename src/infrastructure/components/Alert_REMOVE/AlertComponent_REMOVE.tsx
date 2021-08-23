import { makeStyles } from "@material-ui/core/styles";

import Alert from "../Alerts/Alert";

import MuiAlert from '@material-ui/lab/Alert';
import MuiAlertTitle from "@material-ui/lab/AlertTitle";

const useStyles = makeStyles({
    root: {

    },
    alert: {
        bottom: 12,
        right: 12,
        transition: "transform .6s ease-in-out!important",
        animation: `$toast-in-right .7s`,
    },
    "@keyframes toast-in-right": {
        from: {
            transform: "translateX(100%)",
        },
        to: {
            transform: "translateX(0)",
        },
    }
});

interface IProps {
    alert: Alert,
    deleteAlert: (id: string) => void,
    className?: string
} 

const AlertComponent = (props: IProps) => {
    const classes = useStyles();
    const {alert, deleteAlert, className } = props;
    
    return (
        <MuiAlert className={`${className ? className : ""} ${classes.alert}`}  
            key={alert.id}
            onClose={() => deleteAlert(alert.id)} 
            severity={alert.type}>
            <MuiAlertTitle>{alert.title}</MuiAlertTitle>
            {alert.msg}
        </MuiAlert>
    )
}

export default AlertComponent;
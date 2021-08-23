import { useEffect, useRef, useState } from "react";

import Alert from "./Alert";
import AlertComponent from "./AlertComponent";

import Container from "@material-ui/core/Container";

type UseAlertsType = [
    React.FC<IRenderedAlertsProps>, 
    React.FC<IRenderedAlertsProps>, 
    (alerts: Alert[]) => void
];

interface IRenderedAlertsProps {
    className?: string;
    children?: JSX.Element[];
}

// const useAlerts = (alertClassName: string): UseAlertsType => {
const useAlerts = (): UseAlertsType => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const Dropdown: React.FC<IRenderedAlertsProps> = () => (
        <Container style={{height: 50, backgroundColor: "blue", position: "absolute", top: 0}}>{}</Container>
    )
    const RenderedAlerts = useRef<React.FC<IRenderedAlertsProps>>( 
        // (props = {className: alertClassName}) => <Container className={props.className}>{}</Container>
        (props) => (<Container className={props.className}>{}</Container>)
    );
    
    // const [RenderedAlerts, setRenderedAlerts] = useState<
    //     React.FC<IRenderedAlertsProps>
    // >( EmptyRenderedAlerts )

//     const createAlert = (type: AlertType, title: string, msg: string[] = []) => {
//         const alert = new Alert(type, title, msg)
// console.log("CR", alerts.length)
//         setAlerts([alert, ...alerts]);
//     }
    const createAlerts = (newAlerts: Alert[]) => {
        // const alert = new Alert(type, title, msg)
console.log("CR", alerts.length, newAlerts.length)
        setAlerts([...alerts, ...newAlerts]);
    }

    useEffect(() => {
        if (!alerts.length)
            return;

        const clearIntervals = () => {
            // clearInterval(addInterval)
            //clearInterval(interval)
        }

        const deleteAlert = (id: string) => {
            const idx = alerts.findIndex(e => e.id === id);
            if (idx < 0)
                return;
    
            alerts.splice(idx, 1);
            !alerts.length && clearIntervals();
            setAlerts([...alerts]);
        }

        // const RenderAlerts = () => 
        // <Container>
        //     {alerts.filter(alert => alert.isShowed).map(alert =>
        //         <AlertComponent alert={alert} deleteAlert={deleteAlert} />
        //     )}
        // </Container>;
        
//         const addInterval = setInterval(() => {
//             const idx = alerts.findIndex(v => !v.isShowed);
// console.log("RA IDX", alerts.length, idx)            
//             if (idx < 0)
//                 return;
            
//             alerts[idx].showed = true;
//             const NewRenderedAlerts: React.FC<IRenderedAlertsProps> = (props) => (
//                 <Container className={props.className}>
//                     {alerts.filter(alert => alert.isShowed).map(alert =>
//                         <AlertComponent className={"alertComponent"} alert={alert} deleteAlert={deleteAlert} />
//                     )}
//                 </Container>
//             )
    
//             setRenderedAlerts(NewRenderedAlerts);
//             setAlerts([...alerts])
//         }, 700);
        const addInterval = setInterval(() => {
            const idx = alerts.findIndex(v => !v.isShowed);
console.log("RA IDX", alerts.length, idx)            
            if (idx < 0)
                return;
            
            alerts[idx].showed = true;
            RenderedAlerts.current = (props) => (
                <Container className={props.className}>
                    {alerts.filter(alert => alert.isShowed).map(alert =>
                        <AlertComponent className={"alertComponent"} alert={alert} deleteAlert={deleteAlert} />
                    )}
                </Container>
            )

            // RenderedAlerts.prototype.children = children;
            // : React.FC<IRenderedAlertsProps> = (props) => (
            //     <Container className={props.className}>
            //         {alerts.filter(alert => alert.isShowed).map(alert =>
            //             <AlertComponent className={"alertComponent"} alert={alert} deleteAlert={deleteAlert} />
            //         )}
            //     </Container>
            // )
    
            // setRenderedAlerts(NewRenderedAlerts);
            setAlerts([...alerts])
        }, 700);
        return () => clearIntervals()
    }, [alerts])

    return [Dropdown, RenderedAlerts.current, createAlerts];
}

export default useAlerts;
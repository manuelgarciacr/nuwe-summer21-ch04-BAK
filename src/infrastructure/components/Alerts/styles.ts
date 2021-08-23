import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
        },
        renderedAlerts: {
            position: "absolute",
            right: 12,
            bottom: 12,
            overflowX: "hidden",
            "& .alertComponent": {
                transition: "transform .6s ease-in-out!important",
                animation: `$toast-in-right .7s`,
                "&.MuiAlert-standardSuccess": {
                },
                "&.MuiAlert-standardError": {
                },
                "&.MuiAlert-standardWarning": {
                },
                "&.MuiAlert-standardInfo": {
                }
            }
        },
        "@keyframes toast-in-right": {
            from: {
                transform: "translateX(100%)",
            },
            to: {
                transform: "translateX(0)",
            },
        }
    })
);

export default useStyles;

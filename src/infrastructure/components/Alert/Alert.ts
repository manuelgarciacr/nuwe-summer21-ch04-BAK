import { v4 as uuidv4 } from "uuid";

export type AlertType = "success" | "error" | "warning";

class Alert {
    private readonly _id: string = uuidv4();
    private _showed: boolean = false;

    constructor(
        private _type: AlertType,
        private _title: string,
        private _msg: string[] = []
    ) {
        this._type = _type;
        this._title = _title;
        this._msg = _msg;
    }

    get id() {
        return this._id;
    }

    get isShowed() {
        return this._showed;
    }

    set showed(val: boolean) {
        this._showed = val;
    }

    get type() {
        return this._type;
    }

    get title() {
        return this._title;
    }

    get msg() {
        return this._msg;
    }
}

export default Alert;

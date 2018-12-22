export interface IPortConfig {
    name: string,
    baudRate: number,
    type: string
}

export interface IPortsConfig {
    imu: IPortConfig;
    esc: IPortConfig;
    ble: IPortConfig;
}
export default interface ISerialDevice {
    open(): void;
    close(): void;
    isOpen(): boolean;
    write(data: string): void;
    registerCloseEvent(callback: () => void): void;
    registerDataEvent(callback: (data: string) => void): void;
    registerOpenEvent(callback: () => void): void;
}
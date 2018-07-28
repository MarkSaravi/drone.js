export default interface ISerialDevice {
    open(): void;
    close(): void;
    isOpen(): boolean;
    registerCloseEvent(eventType: string, callback: () => void): void;
    registerDataEvent(callback: (data: string) => void): void;
}
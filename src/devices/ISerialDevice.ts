export default interface ISerialDevice {
    open(onData: () => void, onClose: () => void): void;
    close(): void;
    isOpen(): boolean;
    write(data: string, onSuccess: () => void): void;
}
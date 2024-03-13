declare module 'react-modal' {
    interface Modal {
        id: string;
    }
    
    interface InitOptions {
        onShow?: (modal: Modal) => void;
        onClose?: (modal: Modal) => void;
    }
    
    const Modal: {
        init: (options: InitOptions) => void;
        show: (id: string) => void;
        close: (id: string) => void;
    };

    export default MicroModal;
}

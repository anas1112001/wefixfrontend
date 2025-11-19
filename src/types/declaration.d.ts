declare module '*.module.css'

interface CtxMenu {
    show(menu: any, event: MouseEvent): void;
}

declare let ctxmenu: CtxMenu;
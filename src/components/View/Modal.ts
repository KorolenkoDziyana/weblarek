export class Modal {
    protected closeButton: HTMLButtonElement;
    protected content: HTMLElement;

    constructor(protected container: HTMLElement, onClose: () => void) {
        this.closeButton = container.querySelector('.modal__close') as HTMLButtonElement;
        this.content = container.querySelector('.modal__content') as HTMLElement;

        this.closeButton.addEventListener('click', onClose);

        this.container.addEventListener('mousedown', (event) => {
            if (event.target === this.container) {
                onClose();
            }
        });
    }

    render(content: HTMLElement): HTMLElement {
        this.content.replaceChildren(content);
        return this.container;
    }

    open(): void {
        this.container.classList.add('modal_active');
    }

    close(): void {
        this.container.classList.remove('modal_active');
        this.content.replaceChildren();
    }
}

export function setText(element: HTMLElement | null, value: unknown): void {
    if (element) {
        element.textContent = String(value);
    }
}

export function setDisabled(element: HTMLButtonElement | null, state: boolean): void {
    if (element) {
        element.disabled = state;
    }
}

export function formatPrice(price: number | null): string {
    return price === null ? 'Бесценно' : `${price} синапсов`;
}

export function setCategoryClass(element: HTMLElement, className?: string): void {
    element.className = 'card__category';

    if (className) {
        element.classList.add(className);
    }
}

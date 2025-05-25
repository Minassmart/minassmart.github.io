// Sistema de Máscaras para Inputs
class InputMask {
    constructor() {
        this.initialized = new Set();
    }

    initialize() {
        // Inicializar máscaras de telefone
        document.querySelectorAll('input[type="tel"], input[data-mask="phone"]').forEach(input => {
            if (!this.initialized.has(input)) {
                this.initializePhoneMask(input);
                this.initialized.add(input);
            }
        });

        // Observar novos inputs adicionados dinamicamente
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        const inputs = node.matches('input') ? [node] : node.querySelectorAll('input');
                        inputs.forEach(input => {
                            if ((input.type === 'tel' || input.dataset.mask === 'phone') && !this.initialized.has(input)) {
                                this.initializePhoneMask(input);
                                this.initialized.add(input);
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    initializePhoneMask(input) {
        // Configurar atributos de acessibilidade
        input.setAttribute('autocomplete', 'tel');
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('pattern', '[0-9]*');
        input.setAttribute('maxlength', '15');
        input.setAttribute('placeholder', '(00) 00000-0000');
        
        // Adicionar aria-label se não houver label
        if (!input.labels || input.labels.length === 0) {
            input.setAttribute('aria-label', 'Telefone');
        }

        // Eventos
        input.addEventListener('input', (e) => this.handlePhoneInput(e));
        input.addEventListener('keydown', (e) => this.handlePhoneKeydown(e));
        input.addEventListener('paste', (e) => this.handlePhonePaste(e));
        input.addEventListener('focus', () => {
            // Se estiver vazio, adicionar o DDD padrão
            if (!input.value) {
                input.value = '(';
            }
        });
    }

    handlePhoneInput(e) {
        const input = e.target;
        let value = input.value.replace(/\D/g, '');
        let formattedValue = '';
        let cursorPosition = input.selectionStart;
        const previousLength = input.value.length;

        // Formatar o número baseado no comprimento
        if (value.length <= 11) {
            if (value.length > 0) formattedValue = '(' + value;
            if (value.length > 2) formattedValue = '(' + value.substring(0,2) + ') ' + value.substring(2);
            if (value.length > 7) {
                // Verificar se é celular (9 dígitos) ou fixo (8 dígitos)
                if (value.length === 11) {
                    formattedValue = '(' + value.substring(0,2) + ') ' + value.substring(2,7) + '-' + value.substring(7);
                } else {
                    formattedValue = '(' + value.substring(0,2) + ') ' + value.substring(2,6) + '-' + value.substring(6);
                }
            }
        }

        // Atualizar valor e posição do cursor
        input.value = formattedValue;

        // Ajustar a posição do cursor
        if (cursorPosition < previousLength) {
            const addedChars = this.countAddedChars(formattedValue, cursorPosition);
            input.setSelectionRange(cursorPosition + addedChars, cursorPosition + addedChars);
        }

        // Disparar evento de validação
        this.validatePhone(input);
    }

    handlePhoneKeydown(e) {
        // Permitir apenas números e teclas de controle
        if (!/^\d$/.test(e.key) && 
            !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) &&
            !((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))) {
            e.preventDefault();
        }
    }

    handlePhonePaste(e) {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        const numbers = pastedText.replace(/\D/g, '');
        
        // Simular digitação dos números
        const input = e.target;
        const currentValue = input.value.replace(/\D/g, '');
        const newValue = currentValue + numbers;
        
        let value = newValue.substring(0, 11); // Limitar a 11 dígitos
        this.formatPhone(input, value);
    }

    formatPhone(input, value) {
        let formattedValue = '';
        
        if (value.length > 0) formattedValue = '(' + value;
        if (value.length > 2) formattedValue = '(' + value.substring(0,2) + ') ' + value.substring(2);
        if (value.length > 7) {
            if (value.length === 11) {
                formattedValue = '(' + value.substring(0,2) + ') ' + value.substring(2,7) + '-' + value.substring(7);
            } else {
                formattedValue = '(' + value.substring(0,2) + ') ' + value.substring(2,6) + '-' + value.substring(6);
            }
        }

        input.value = formattedValue;
    }

    countAddedChars(formattedValue, position) {
        let addedChars = 0;
        for (let i = 0; i < position; i++) {
            if (/[\(\)\s-]/.test(formattedValue.charAt(i))) {
                addedChars++;
            }
        }
        return addedChars;
    }

    validatePhone(input) {
        const value = input.value.replace(/\D/g, '');
        const isValid = value.length >= 10 && value.length <= 11;
        
        // Atualizar estado visual
        input.classList.toggle('valid', isValid);
        input.classList.toggle('invalid', !isValid);
        
        // Atualizar atributos de validação
        if (isValid) {
            input.setCustomValidity('');
        } else {
            input.setCustomValidity('Por favor, insira um número de telefone válido');
        }

        // Disparar evento customizado
        const event = new CustomEvent('phoneValidation', {
            detail: { isValid, value }
        });
        input.dispatchEvent(event);
    }

    // Método público para formatar número manualmente
    static format(number) {
        const cleaned = number.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.substring(0,2)}) ${cleaned.substring(2,7)}-${cleaned.substring(7)}`;
        } else if (cleaned.length === 10) {
            return `(${cleaned.substring(0,2)}) ${cleaned.substring(2,6)}-${cleaned.substring(6)}`;
        }
        return number;
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const inputMask = new InputMask();
    inputMask.initialize();
}); 
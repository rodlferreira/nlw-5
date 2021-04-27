//Essa funcao recebe a duracao que eh um numero e retorno uma 'String'

export function convertDurationToTimeString(duration: number) {

    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60); //arredonda para o menor numero que sobra dessa divisao
    const seconds = duration % 60;
    
    const timeString = [hours, minutes, seconds]
    .map(unit => String(unit).padStart(2, '0')) //sempre que o minuto ou hora ou segundo, tiver um digito, o '0' eh acrescentado.
    .join(':')

    return timeString;

}
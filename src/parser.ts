
export class Parser
{
    static parseCode(str: string) {
        return str.substring(str.indexOf("```")+3, str.lastIndexOf("```"));
    }

    // TODO: Find more efficient solution to this... (low priority)
    static parseFlag(str: string, flag: string) {
        str = (str.substring(0, str.indexOf("```")) + str.substring(str.lastIndexOf("```")+3));
        if(str.indexOf(flag) != -1) {
            str = str.substring(str.indexOf(flag));
            let params = str.split(" ");
            return params[1].trim().toLowerCase();
        }
        return "";
    }
}

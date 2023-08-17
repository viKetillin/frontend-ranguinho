export default (str: String | string) => {
    str = str.replace(/ /g, "-")
    return str
}
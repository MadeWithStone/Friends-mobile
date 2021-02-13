import * as SecureStore from "expo-secure-store"
/*const config = {
  primaryColor: "#b16cd9",
  secondaryColor: "#000",
  textColor: "#fff", //515151
  icon: 22,
  iconFocused: 24,
}*/

export default class config {
  static _primaryColor = "#b16cd9"
  static _secondaryColor = "#fff"
  static _textColor = "#515151"
  static _icon = 22
  static _iconFocused = 24
  constructor(primaryColor, secondaryColor, textColor, icon, iconFocused) {
    _primaryColor = primaryColor
    _secondaryColor = secondaryColor
    _textColor = textColor
    _icon = icon
    _iconFocused = iconFocused
  }

  static get primaryColor() {
    return this._primaryColor
  }
  static get secondaryColor() {
    return this._secondaryColor
  }
  static get textColor() {
    return this._textColor
  }
  static get icon() {
    return this._icon
  }
  static get iconFocused() {
    return this._iconFocused
  }

  /**
   * @param {{ primaryColor: string; secondaryColor: string; textColor: string; icon: number; iconFocused: number; }} cData
   */
  static set configData(cData) {
    this._primaryColor =
      cData.primaryColor != null ? cData.primaryColor : this._primaryColor
    this._secondaryColor =
      cData.secondaryColor != null ? cData.secondaryColor : this._secondaryColor
    this._textColor =
      cData.textColor != null ? cData.textColor : this._textColor
    this._icon = cData.icon != null ? cData.icon : this._icon
    this._iconFocused =
      cData.iconFocused != null ? cData.iconFocused : this._iconFocused
  }

  static async init() {
    return new Promise(async (resolve, reject) => {
      let savedData = await SecureStore.getItemAsync("config")
      try {
        console.log("loaded data: " + savedData)
        if (savedData != null) {
          savedData = JSON.parse(savedData)
          let data = savedData
          console.log("loaded data: " + savedData)
          this._primaryColor =
            data.primaryColor != null ? data.primaryColor : this._primaryColor
          this._secondaryColor =
            data.secondaryColor != null
              ? data.secondaryColor
              : this._secondaryColor
          this._textColor =
            data.textColor != null ? data.textColor : this._textColor
          this._icon = data.icon != null ? data.icon : this._icon
          this._iconFocused =
            data.iconFocused != null ? data.iconFocused : this._iconFocused

          console.log("set all data")
        }
        resolve()
      } catch (error) {
        console.log("error " + error)
        reject()
      }
    })
  }
  static async save() {
    let data = {
      primaryColor: this._primaryColor,
      secondaryColor: this._secondaryColor,
      textColor: this._textColor,
      icon: this._icon,
      iconFocused: this._iconFocused,
    }
    await SecureStore.setItemAsync("config", JSON.stringify(data))
    console.log("saved")
  }
}

//export default config

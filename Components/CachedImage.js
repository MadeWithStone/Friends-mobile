// Modules
import React, { useEffect, useState, useRef } from "react"
import * as FileSystem from "expo-file-system"
import PropTypes from "prop-types"

// Components
import { Image } from "react-native"

/**
 * image view with caching
 *
 * @memberof Components
 * @component
 * @prop {object} source source object (uri field)
 * @prop {string} cacheKey key to save cached image with
 * @prop {objec} style custom style object
 */
const CachedImage = (props) => {
  const {
    source: { uri },
    cacheKey,
  } = props
  const filesystemURI = `${FileSystem.cacheDirectory}${cacheKey}`

  const [imgURI, setImgURI] = useState(filesystemURI)

  const componentIsMounted = useRef(true)

  useEffect(() => {
    const loadImage = async ({ fileURI }) => {
      try {
        // Use the cached image if it exists
        const metadata = await FileSystem.getInfoAsync(fileURI)
        if (!metadata.exists) {
          // download to cache
          if (componentIsMounted.current) {
            setImgURI(null)
            await FileSystem.downloadAsync(uri, fileURI)
          }
          if (componentIsMounted.current) {
            setImgURI(fileURI)
          }
        }
      } catch (err) {
        console.log() // eslint-disable-line no-console
        setImgURI(uri)
      }
    }

    loadImage({ fileURI: filesystemURI })

    return () => {
      componentIsMounted.current = false
    }
  }, [])

  return (
    <Image
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      source={{
        uri: imgURI,
      }}
    />
  )
}

CachedImage.propTypes = {
  source: PropTypes.object.isRequired,
  cacheKey: PropTypes.string.isRequired,
}

export default CachedImage

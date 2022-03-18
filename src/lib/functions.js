export const getPositionPermission = async () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position)
      },
      (error) => {
        reject(error)
      }
    )
  })
}

const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}
export const round = (num, places) => {
  return +parseFloat(num).toFixed(places)
}

export const getDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 && lon1 && lat2 && lon2) {
    var R = 6371 // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1)
    var dLon = deg2rad(lon2 - lon1)
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var d = R * c // Distance in km
    return round(d, 1)
  } else {
    return 'Ukjent'
  }
}

export const findClosestStation = async (stations, position) => {
  const closestStation = stations.reduce((prev, curr) => {
    const distance = getDistance(position.lat, position.lng, curr.lat, curr.lon)
    if (distance < prev.distance) {
      return {
        ...curr,
        distance,
      }
    }
    return prev
  })
  return {
    closestStation,
  }
}

export const findNClosestStations = async (stations, position, n) => {
  const closestStations = stations.reduce(
    (prev, curr) => {
      const distance = getDistance(
        position.lat,
        position.lng,
        curr.lat,
        curr.lon
      )
      if (distance < prev.distance) {
        return {
          ...prev,
          stations: [
            {
              ...curr,
              distance,
            },
            ...prev.stations,
          ],
        }
      }
      return prev
    },
    {
      distance: Infinity,
      stations: [],
    }
  )

  return {
    closestStations: closestStations.stations
      .sort((a, b) => a.distance - b.distance)
      .slice(0, n),
  }
}

export const timeSince = (date) => {
  const now = new Date().getTime()
  const seconds = Math.floor((now - date * 1000) / 1000)
  let interval = Math.floor(seconds / 31536000)
  if (interval > 1) {
    return interval + ' år'
  }
  interval = Math.floor(seconds / 2592000)
  if (interval > 1) {
    return interval + ' måneder'
  }
  interval = Math.floor(seconds / 86400)
  if (interval > 1) {
    return interval + ' dager'
  }
  interval = Math.floor(seconds / 3600)
  if (interval > 1) {
    return interval + ' t'
  }
  interval = Math.floor(seconds / 60)
  if (interval > 1) {
    return interval + ' min'
  }
  return Math.floor(seconds) + ' sek'
}

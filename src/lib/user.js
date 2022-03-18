export const getFavoriteFromApi = async (id) => {
  try {
    const favorite = await fetch(
      `http://localhost/api/read_single.php?user_token=${id}`
    )
    if (favorite.status === 200) {
      const res = await favorite.json()
      const station = res.user_station ? Number(res.user_station) : null
      return station
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

export const putFavoriteInApi = async (id, station) => {
  const data = {
    user_token: id,
    user_station: station,
  }
  if (typeof getFavoriteFromApi(id) === 'number') {
    return
  } else {
    try {
      await fetch(
        `http://localhost/api/create.php?user_token=${id}&user_station=${station}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )
    } catch (error) {
      console.log(error)
      return null
    }
  }
}

export const changeFavoriteInApi = async (id, station) => {
  const data = {
    user_token: id,
    user_station: station,
  }
  if (getFavoriteFromApi(id) === station) {
    return
  } else {
    try {
      await fetch(
        `http://localhost/api/update.php?user_token=${id}&user_station=${station}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )
    } catch (error) {
      console.log(error)
      return null
    }
  }
}

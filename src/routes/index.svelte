<script context="module">
  import { getFavoriteFromApi } from '$lib/user.js'

  export async function load({ session }) {
    const userId = session
    const favorite = await getFavoriteFromApi(userId)
    try {
      const stations = await fetch(
        'https://gbfs.urbansharing.com/oslobysykkel.no/station_information.json'
      )
      const bikes = await fetch(
        'https://gbfs.urbansharing.com/oslobysykkel.no/station_status.json'
      )
      const stationsJson = await stations.json()
      const bikesJson = await bikes.json()
      const stationsData = stationsJson.data.stations
      const bikesData = bikesJson.data.stations
      const stationsWithBikes = stationsData.map((station) => {
        const bikes = bikesData.filter(
          (bike) => bike.station_id === station.station_id
        )[0]
        return {
          ...station,
          bikes,
        }
      })
      return {
        props: {
          userId,
          favorite,
          stations: stationsWithBikes,
        },
      }
    } catch (error) {
      console.log(error)
      return {
        props: {
          userId,
          favorite,
          stations: [],
        },
      }
    }
  }
</script>

<script>
  export let stations
  export let userId
  export let favorite
  import { onMount } from 'svelte'
  import {
    getPositionPermission,
    findNClosestStations,
    getDistance,
    timeSince,
  } from '$lib/functions.js'

  import { putFavoriteInApi, changeFavoriteInApi } from '$lib/user.js'

  const getFavorite = (stations, id) => {
    return stations.filter(
      (station) => Number(station.station_id) === Number(id)
    )[0]
  }

  let position = {}
  let closestStations
  $: stationAmount = 5
  let mounted = false
  let favoriteStation

  onMount(async () => {
    console.log('session', userId, favorite)
    mounted = true
    favoriteStation = getFavorite(stations, favorite)
  })

  $: console.log('favorite station', favoriteStation)

  const getPosition = async () => {
    const pos = await getPositionPermission()
    position = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    }
  }

  $: if (mounted) {
    closestStations = findNClosestStations(stations, position, stationAmount)
  }

  const setFavorite = (station) => {
    const stationId = Number(station.station_id)
    if (favoriteStation) {
      changeFavoriteInApi(userId, stationId)
    } else {
      putFavoriteInApi(userId, stationId)
    }
    const localfav = getFavorite(stations, stationId)
    console.log(localfav)
    favoriteStation = localfav
  }
</script>

<h1>Nærmeste bysykkelstasjoner</h1>
<button on:click={getPosition}>Finn stasjoner</button>
<input type="range" min="1" max={stations?.length} bind:value={stationAmount} />
{stationAmount}
{#if mounted}
  <div>
    <table>
      <thead>
        <tr>
          <th />
          <th>Stasjon</th>
          <th>Avstand</th>
          <th>Ledig</th>
          <th>Oppdatert</th>
          <th>Adresse</th>
        </tr>
      </thead>
      {#if favoriteStation}
        <tr class="favorite">
          <td />
          <td>{favoriteStation.name}</td>
          <td class="nobreak"
            >{getDistance(
              position.lat,
              position.lng,
              favoriteStation.lat,
              favoriteStation.lon
            )} km</td
          >
          <td class="nobreak"
            >{favoriteStation.bikes.num_bikes_available} / {favoriteStation.capacity}</td
          >
          <td class="nobreak"
            >{timeSince(favoriteStation.bikes.last_reported)}</td
          >
          <td>{favoriteStation.address}</td>
        </tr>
      {/if}

      {#await closestStations then stations}
        <tbody>
          {#each stations.closestStations as station}
            {#if station.station_id != favoriteStation.station_id}
              <tr>
                <td>
                  <button class="button" on:click={() => setFavorite(station)}
                    >⭐️</button
                  >
                </td>
                <td>{station.name}</td>
                <td class="nobreak">{station.distance} km</td>
                <td class="nobreak"
                  >{station.bikes.num_bikes_available} / {station.capacity}</td
                >
                <td class="nobreak">{timeSince(station.bikes.last_reported)}</td
                >
                <td>{station.address}</td>
              </tr>
            {/if}
          {/each}
        </tbody>
      {/await}
    </table>
  </div>
{/if}

<style>
  .button {
    background: #fff;
    border: 0;
    border-radius: 9999px;
    color: #333;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.3rem 0.5rem;
    transition: all 0.2s ease-in-out;
  }
  .button:hover {
    background: #fafafa;
  }
  .button:active {
    background: #f5f5f5;
  }
  .favorite {
    background: palegreen;
  }

  .nobreak {
    white-space: nowrap;
  }
  table {
    width: 750px;
    border-collapse: collapse;
    margin: 1rem 0;
  }

  /* Zebra striping */
  tbody tr:nth-of-type(odd) {
    background: #eee;
  }

  th {
    font-weight: bold;
  }

  td,
  th {
    padding: 10px;
    text-align: left;
    font-size: 18px;
  }

  @media only screen and (max-width: 760px),
    (min-device-width: 768px) and (max-device-width: 1024px) {
    table {
      width: 100%;
      margin: 20px 0;
    }
  }
</style>

import { db } from './firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  orderBy,
} from 'firebase/firestore'

// Movies Collection
export async function addMovie(movieData: any) {
  try {
    const docRef = await addDoc(collection(db, 'movies'), {
      ...movieData,
      created_at: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding movie:', error)
    throw error
  }
}

export async function getMovies() {
  try {
    const q = query(collection(db, 'movies'), orderBy('created_at', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error getting movies:', error)
    throw error
  }
}

export async function updateMovie(movieId: string, movieData: any) {
  try {
    await updateDoc(doc(db, 'movies', movieId), movieData)
  } catch (error) {
    console.error('Error updating movie:', error)
    throw error
  }
}

export async function deleteMovie(movieId: string) {
  try {
    await deleteDoc(doc(db, 'movies', movieId))
  } catch (error) {
    console.error('Error deleting movie:', error)
    throw error
  }
}

// Series Collection
export async function addSeries(seriesData: any) {
  try {
    const docRef = await addDoc(collection(db, 'series'), {
      ...seriesData,
      created_at: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding series:', error)
    throw error
  }
}

export async function getSeries() {
  try {
    const q = query(collection(db, 'series'), orderBy('created_at', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error getting series:', error)
    throw error
  }
}

export async function updateSeries(seriesId: string, seriesData: any) {
  try {
    await updateDoc(doc(db, 'series', seriesId), seriesData)
  } catch (error) {
    console.error('Error updating series:', error)
    throw error
  }
}

export async function deleteSeries(seriesId: string) {
  try {
    await deleteDoc(doc(db, 'series', seriesId))
  } catch (error) {
    console.error('Error deleting series:', error)
    throw error
  }
}

// Users Collection
export async function addUser(userId: string, userData: any) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      updated_at: new Date(),
    }).catch(async () => {
      // If user doc doesn't exist, create it
      await addDoc(collection(db, 'users'), {
        uid: userId,
        ...userData,
        created_at: new Date(),
      })
    })
  } catch (error) {
    console.error('Error adding/updating user:', error)
    throw error
  }
}

export async function getUser(userId: string) {
  try {
    const q = query(collection(db, 'users'), where('uid', '==', userId))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.docs.length > 0) {
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      }
    }
    return null
  } catch (error) {
    console.error('Error getting user:', error)
    throw error
  }
}

import { db } from './firebase';
import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore';

// ── CLIENTS ──
export async function getClients() {
  const snap = await getDocs(collection(db, 'clients'));
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

export async function addClient(data) {
  return await addDoc(collection(db, 'clients'), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function updateClient(id, data) {
  await updateDoc(doc(db, 'clients', id), data);
}

export async function deleteClient(id) {
  await deleteDoc(doc(db, 'clients', id));
}

// ── BORNES ──
export async function getBornes() {
  const snap = await getDocs(collection(db, 'bornes'));
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

export async function addBorne(data) {
  return await addDoc(collection(db, 'bornes'), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function updateBorne(id, data) {
  await updateDoc(doc(db, 'bornes', id), data);
}

export async function deleteBorne(id) {
  await deleteDoc(doc(db, 'bornes', id));
}

// ── DEMANDES ──
export async function getDemandes() {
  const snap = await getDocs(collection(db, 'demandes'));
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

export async function getDemandesClient(email) {
  const q = query(collection(db, 'demandes'), where('clientEmail', '==', email));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

export async function addDemande(data) {
  return await addDoc(collection(db, 'demandes'), {
    ...data,
    statut: 'En attente',
    createdAt: serverTimestamp()
  });
}

export async function archiverDemande(id) {
  await updateDoc(doc(db, 'demandes', id), { archived: true });
}

export async function updateDemande(id, data) {
  await updateDoc(doc(db, 'demandes', id), data);
}

// ── MESSAGES ──
export async function getMessages() {
  const snap = await getDocs(collection(db, 'messages'));
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

export async function addMessage(data) {
  return await addDoc(collection(db, 'messages'), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function deleteMessage(id) {
  await deleteDoc(doc(db, 'messages', id));
}

// ── NOTIFICATIONS ──
export async function getNotifications(clientEmail) {
  const q = query(collection(db, 'notifications'), where('clientEmail', '==', clientEmail));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

export async function deleteNotification(id) {
  await deleteDoc(doc(db, 'notifications', id));
}

export async function addNotification(data) {
  return await addDoc(collection(db, 'notifications'), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function getDemandesArchivees() {
  const snap = await getDocs(collection(db, 'demandes'));
  return snap.docs
    .map(d => ({id: d.id, ...d.data()}))
    .filter(d => d.archived === true);
}

export async function getFaq() {
  const snap = await getDocs(query(collection(db, 'faq'), orderBy('ordre', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addFaqItem(data) {
  return await addDoc(collection(db, 'faq'), { ...data, createdAt: serverTimestamp() });
}

export async function updateFaqItem(id, data) {
  await updateDoc(doc(db, 'faq', id), data);
}

export async function deleteFaqItem(id) {
  await deleteDoc(doc(db, 'faq', id));
}

export async function getRoles() {
  const snap = await getDocs(query(collection(db, 'roles'), orderBy('nom', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addRole(data) {
  return await addDoc(collection(db, 'roles'), { ...data, createdAt: serverTimestamp() });
}

export async function deleteRole(id) {
  await deleteDoc(doc(db, 'roles', id));
}
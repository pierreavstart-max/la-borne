import { db } from './firebase';
import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore';

// Helper : normalise un email en minuscules
function normalizeEmail(email) {
  return email ? email.toLowerCase().trim() : email;
}

// ── CLIENTS ──
export async function getClients() {
  const snap = await getDocs(collection(db, 'clients'));
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

export async function addClient(data) {
  return await addDoc(collection(db, 'clients'), {
    ...data,
    email: normalizeEmail(data.email),
    createdAt: serverTimestamp()
  });
}

export async function updateClient(id, data) {
  const cleanData = { ...data };
  if (cleanData.email) cleanData.email = normalizeEmail(cleanData.email);
  await updateDoc(doc(db, 'clients', id), cleanData);
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
  const cleanData = { ...data };
  if (cleanData.clientEmail) cleanData.clientEmail = normalizeEmail(cleanData.clientEmail);
  return await addDoc(collection(db, 'bornes'), {
    ...cleanData,
    createdAt: serverTimestamp()
  });
}

export async function updateBorne(id, data) {
  const cleanData = { ...data };
  if (cleanData.clientEmail) cleanData.clientEmail = normalizeEmail(cleanData.clientEmail);
  await updateDoc(doc(db, 'bornes', id), cleanData);
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
  const q = query(collection(db, 'demandes'), where('clientEmail', '==', normalizeEmail(email)));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

export async function addDemande(data) {
  const cleanData = { ...data };
  if (cleanData.clientEmail) cleanData.clientEmail = normalizeEmail(cleanData.clientEmail);
  return await addDoc(collection(db, 'demandes'), {
    ...cleanData,
    statut: 'En attente',
    createdAt: serverTimestamp()
  });
}

export async function archiverDemande(id) {
  await updateDoc(doc(db, 'demandes', id), { archived: true });
}

export async function updateDemande(id, data) {
  const cleanData = { ...data };
  if (cleanData.clientEmail) cleanData.clientEmail = normalizeEmail(cleanData.clientEmail);
  await updateDoc(doc(db, 'demandes', id), cleanData);
}

// ── MESSAGES ──
export async function getMessages() {
  const snap = await getDocs(collection(db, 'messages'));
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

export async function addMessage(data) {
  const cleanData = { ...data };
  if (cleanData.destType === 'client' && cleanData.dest) {
    cleanData.dest = normalizeEmail(cleanData.dest);
  }
  return await addDoc(collection(db, 'messages'), {
    ...cleanData,
    createdAt: serverTimestamp()
  });
}

export async function deleteMessage(id) {
  await deleteDoc(doc(db, 'messages', id));
}

// ── NOTIFICATIONS ──
export async function getNotifications(clientEmail) {
  const q = query(collection(db, 'notifications'), where('clientEmail', '==', normalizeEmail(clientEmail)));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

export async function deleteNotification(id) {
  await deleteDoc(doc(db, 'notifications', id));
}

export async function addNotification(data) {
  const cleanData = { ...data };
  if (cleanData.clientEmail) cleanData.clientEmail = normalizeEmail(cleanData.clientEmail);
  return await addDoc(collection(db, 'notifications'), {
    ...cleanData,
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

export async function getMenuConfig() {
  const snap = await getDocs(collection(db, 'menuConfig'));
  return snap.docs[0] ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
}

export async function saveMenuConfig(data) {
  const existing = await getMenuConfig();
  if (existing) {
    await updateDoc(doc(db, 'menuConfig', existing.id), data);
    return existing.id;
  } else {
    const ref = await addDoc(collection(db, 'menuConfig'), data);
    return ref.id;
  }
}
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase'; // <-- Make sure Supabase is imported!

// --- Web-Safe SVG Icons ---
import { CheckCircle, Minus, Plus, ShoppingCart, X } from 'lucide-react-native';

// --- 1. PRODUCT DATA ---
const TOOLS = [
  { id: 't1', name: 'Brush Pens', price: 130, min: 1, max: 5, image: require('../../assets/images/brushpens.jpg') },
  { id: 't2', name: 'Acupuncture Needles (Box of 100)', price: 250, min: 1, max: 20, image: require('../../assets/images/needles.jpg') },
  { id: 't3', name: 'Byol magnet (Packet of 10)', price: 40, min: 1, max: 10, image: require('../../assets/images/byol-magnet.jpg') },
  { id: 't4', name: 'Chakra magnet (1 piece)', price: 40, min: 1, max: 10, image: require('../../assets/images/chakra-magnet.jpg') },
  { id: 't5', name: 'Cluster magnet (1 piece)', price: 40, min: 1, max: 10, image: require('../../assets/images/cluster-magnet.jpg') },
  { id: 't6', name: 'Mega-Byol magnet (1 piece)', price: 40, min: 1, max: 10, image: require('../../assets/images/mega-byol-magnet.jpg') },
  { id: 't7', name: 'surgical Paper tape (0.5 inch)', price: 25, min: 1, max: 10, image: require('../../assets/images/0.5- inch-tape.jpg') },
  { id: 't8', name: 'Surgical Paper tape (1 inch)', price: 50, min: 1, max: 10, image: require('../../assets/images/1-inch-tape.jpg') },
  { id: 't9', name: 'Sujok Finger Rings (1 piece)', price: 15, min: 1, max: 10, image: require('../../assets/images/sujok-ring.jpg') },
  { id: 't10', name: 'Jimmy stick (small)', price: 50, min: 1, max: 15, image: require('../../assets/images/jimmy-stick.jpg') },
];

export default function ToolsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const { session } = useAuth();

  const updateQuantity = (id: string, delta: number, min: number, max: number) => {
    setCart(prev => {
      const currentQty = prev[id] || 0;
      const newQty = currentQty + delta;
      
      if (newQty < 0) return prev;
      if (newQty > max) {
        Alert.alert('Limit Reached', `You can only order up to ${max} of this item.`);
        return prev;
      }
      if (newQty > 0 && newQty < min && delta > 0) return { ...prev, [id]: min };
      
      const updatedCart = { ...prev, [id]: newQty };
      if (newQty === 0) delete updatedCart[id];
      return updatedCart;
    });
  };

  const getCartTotal = () => {
    return Object.keys(cart).reduce((total, id) => {
      const product = TOOLS.find(t => t.id === id);
      return total + (product ? product.price * cart[id] : 0);
    }, 0);
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const handlePlaceOrder = async () => {
    setErrorMessage(''); 

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('⚠️ Please fill out your name, phone, and delivery address.');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      setErrorMessage('⚠️ Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9.');
      return;
    }

    setIsSubmitting(true);

    // 1. Format the cart data nicely for the Database
    const dbOrderItems = Object.keys(cart).map(id => {
      const product = TOOLS.find(t => t.id === id);
      return {
        product_id: id,
        name: product?.name,
        quantity: cart[id],
        price: product?.price,
        subtotal: (product?.price || 0) * cart[id]
      };
    });

    // 2. Format the order details for the Email
    let orderDetails = dbOrderItems.map(item => 
      `- ${item.quantity}x ${item.name} (₹${item.subtotal})`
    ).join('\n');

    try {
      // --- NEW: SAVE TO SUPABASE DATABASE ---
      const { error: dbError } = await supabase.from('shop_orders').insert({
        user_id: session.user.id,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_address: address.trim(),
        order_items: dbOrderItems, // Saves as a clean JSON array
        total_amount: getCartTotal(),
        status: 'Pending'
      });

      if (dbError) throw new Error(`Database Error: ${dbError.message}`);
      // --------------------------------------

      // --- EXISTING: SEND EMAILJS NOTIFICATION ---
      const payload = {
        service_id: 'service_f0r5s3m',
        template_id: 'template_yjobutf', 
        user_id: 'uyrAhpSIYeVaQQ3UZ',    
        template_params: {
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_address: address.trim(),
          order_details: orderDetails,
          total_amount: getCartTotal()
        }
      };

      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        throw new Error(`Email Error: ${errorText}`);
      }
      // -------------------------------------------

      // If both DB and Email succeed, clear cart and show success!
      setCart({});
      setName('');
      setPhone('');
      setAddress('');
      setIsCartOpen(false);
      setOrderPlaced(true);

    } catch (error: any) {
      console.error("Order submission failed:", error);
      setErrorMessage("❌ There was a problem sending your order. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        key={isDesktop ? 'desktop-grid' : 'mobile-list'} 
        data={TOOLS}
        keyExtractor={item => item.id}
        numColumns={isDesktop ? 2 : 1}
        columnWrapperStyle={isDesktop ? styles.row : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const qty = cart[item.id] || 0;
          return (
            <View style={[styles.card, isDesktop && styles.cardDesktop]}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
                
                <View style={styles.qtyContainer}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, -1, item.min, item.max)} activeOpacity={0.7}>
                    <Minus size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, 1, item.min, item.max)} activeOpacity={0.7}>
                    <Plus size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <View style={styles.floatingCartWrapper} pointerEvents="box-none">
          <TouchableOpacity style={styles.floatingCart} onPress={() => setIsCartOpen(true)} activeOpacity={0.9}>
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalItems}</Text></View>
            <Text style={styles.floatingCartText}>View Cart - ₹{getCartTotal()}</Text>
            <ShoppingCart size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Cart Modal - Fully Responsive Backdrop */}
      <Modal visible={isCartOpen} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Cart</Text>
              <TouchableOpacity onPress={() => setIsCartOpen(false)}>
                <X size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.sectionTitle}>Delivery Details</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Full Name" 
                value={name} 
                onChangeText={(text) => { setName(text); setErrorMessage(''); }} 
                placeholderTextColor={Colors.textSecondary} 
                editable={!isSubmitting}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Phone Number (e.g. 9876543210)" 
                placeholderTextColor={Colors.textSecondary} 
                keyboardType="phone-pad" 
                maxLength={10} 
                value={phone} 
                onChangeText={(text) => { setPhone(text); setErrorMessage(''); }} 
                editable={!isSubmitting}
              />
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                placeholder="Full Delivery Address" 
                placeholderTextColor={Colors.textSecondary} 
                multiline 
                numberOfLines={3} 
                value={address} 
                onChangeText={(text) => { setAddress(text); setErrorMessage(''); }} 
                editable={!isSubmitting}
              />

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Order Summary</Text>
              {Object.keys(cart).map(id => {
                const product = TOOLS.find(t => t.id === id);
                if (!product) return null;
                return (
                  <View key={id} style={styles.summaryRow}>
                    <Text style={styles.summaryText}>{cart[id]}x {product.name}</Text>
                    <Text style={styles.summaryPrice}>₹{product.price * cart[id]}</Text>
                  </View>
                );
              })}
              <View style={styles.totalRow}>
                <Text style={styles.totalText}>Total Estimate:</Text>
                <Text style={styles.totalAmount}>₹{getCartTotal()}</Text>
              </View>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <TouchableOpacity 
                style={[styles.checkoutBtn, isSubmitting && styles.checkoutBtnDisabled]} 
                onPress={handlePlaceOrder}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <ShoppingCart size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.checkoutBtnText}>Place Order</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={orderPlaced} transparent={true} animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            <CheckCircle size={80} color={Colors.primary} />
            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={styles.successText}>Your order has been sent successfully. We will contact you shortly to confirm delivery details.</Text>
            <TouchableOpacity style={styles.successBtn} onPress={() => setOrderPlaced(false)} activeOpacity={0.8}>
              <Text style={styles.successBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: 8, paddingBottom: 100, maxWidth: 1100, alignSelf: 'center', width: '100%' },
  row: { justifyContent: 'space-between', paddingHorizontal: 8 },
  
  card: { 
    flexDirection: 'row', backgroundColor: Colors.surface, margin: 8, borderRadius: 16, padding: 12, 
    borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, flex: 1, minWidth: 280 
  },
  cardDesktop: { maxWidth: '48%' },

  image: { width: 80, height: 80, borderRadius: 8, marginRight: 12, backgroundColor: '#F3F4F6' },
  info: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  price: { fontSize: 14, color: Colors.primary, fontWeight: '600', marginBottom: 8 },
  
  qtyContainer: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  qtyText: { marginHorizontal: 16, fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  
  floatingCartWrapper: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
  floatingCart: { 
    backgroundColor: Colors.primary, borderRadius: 30, flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 32, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 
  },
  cartBadge: { position: 'absolute', top: -5, left: -5, backgroundColor: Colors.accent, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  floatingCartText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' },
  modalContainer: { 
    backgroundColor: Colors.surface, width: '100%', maxWidth: 700, 
    borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', overflow: 'hidden' 
  },
  
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 10, marginTop: 10 },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, padding: 15, marginBottom: 12, fontSize: 16, color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryText: { fontSize: 16, color: Colors.textSecondary, flex: 1, paddingRight: 10 },
  summaryPrice: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EAEAEA' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  
  errorText: { color: '#e74c3c', marginTop: 15, marginBottom: 5, textAlign: 'center', fontWeight: '600' },
  
  checkoutBtn: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, marginTop: 20, marginBottom: 50 },
  checkoutBtnDisabled: { backgroundColor: '#95a5a6', opacity: 0.7 },
  checkoutBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  successBox: { backgroundColor: Colors.surface, width: '90%', maxWidth: 400, padding: 30, borderRadius: 20, alignItems: 'center' },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 15, marginBottom: 10 },
  successText: { textAlign: 'center', color: Colors.textSecondary, fontSize: 16, lineHeight: 24, marginBottom: 20 },
  successBtn: { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 25 },
  successBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
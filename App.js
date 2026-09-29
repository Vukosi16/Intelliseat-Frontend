import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScreenIndex from './screens/ScreenIndex';
import { screens } from './screens/registry';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="ScreenIndex">
          <Stack.Screen name="ScreenIndex" component={ScreenIndex} options={{ title: 'IntelliSeat Screens' }} />
          {screens.map((s) => (
            <Stack.Screen key={s.name} name={s.name} component={s.component} />
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
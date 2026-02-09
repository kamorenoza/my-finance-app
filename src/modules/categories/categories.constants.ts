import Cat1Icon from '@/assets/icons/categories/Cat1.icon.vue'
import Cat2Icon from '@/assets/icons/categories/Cat2.icon.vue'
import Cat3Icon from '@/assets/icons/categories/Cat3.icon.vue'
import Cat4Icon from '@/assets/icons/categories/Cat4.icon.vue'
import Cat5Icon from '@/assets/icons/categories/Cat5.icon.vue'
import Cat6Icon from '@/assets/icons/categories/Cat6.icon.vue'
import Cat7Icon from '@/assets/icons/categories/Cat7.icon.vue'
import Cat8Icon from '@/assets/icons/categories/Cat8.icon.vue'
import Cat9Icon from '@/assets/icons/categories/Cat9.icon.vue'
import Cat10Icon from '@/assets/icons/categories/Cat10.icon.vue'
import Cat11Icon from '@/assets/icons/categories/Cat11.icon.vue'
import Cat12Icon from '@/assets/icons/categories/Cat12.icon.vue'
import Cat13Icon from '@/assets/icons/categories/Cat13.icon.vue'
import Cat14Icon from '@/assets/icons/categories/Cat14.icon.vue'
import Cat15Icon from '@/assets/icons/categories/Cat15.icon.vue'
import Cat16Icon from '@/assets/icons/categories/Cat16.icon.vue'
import type { Component } from 'vue'
import Cat17Icon from '@/assets/icons/categories/Cat17.icon.vue'
import Cat18Icon from '@/assets/icons/categories/Cat18.icon.vue'
import Cat19Icon from '@/assets/icons/categories/Cat19.icon.vue'
import Cat20Icon from '@/assets/icons/categories/Cat20.icon.vue'
import Cat21Icon from '@/assets/icons/categories/Cat21.icon.vue'
import Cat22Icon from '@/assets/icons/categories/Cat22.icon.vue'
import Cat23Icon from '@/assets/icons/categories/Cat23.icon.vue'
import Cat24Icon from '@/assets/icons/categories/Cat24.icon.vue'
import Cat25Icon from '@/assets/icons/categories/Cat25.icon.vue'
import Cat26Icon from '@/assets/icons/categories/Cat26.icon.vue'
import Cat27Icon from '@/assets/icons/categories/Cat27.icon.vue'
import Cat28Icon from '@/assets/icons/categories/Cat28.icon.vue'
import Cat29Icon from '@/assets/icons/categories/Cat29.icon.vue'
import Cat30Icon from '@/assets/icons/categories/Cat30.icon.vue'

export interface CategoryIconOption {
  key: string
  icon: Component
}

export const categoryIcons: CategoryIconOption[] = [
  { key: 'cat1', icon: Cat1Icon },
  { key: 'cat2', icon: Cat2Icon },
  { key: 'cat3', icon: Cat3Icon },
  { key: 'cat4', icon: Cat4Icon },
  { key: 'cat5', icon: Cat5Icon },
  { key: 'cat6', icon: Cat6Icon },
  { key: 'cat7', icon: Cat7Icon },
  { key: 'cat8', icon: Cat8Icon },
  { key: 'cat9', icon: Cat9Icon },
  { key: 'cat10', icon: Cat10Icon },
  { key: 'cat11', icon: Cat11Icon },
  { key: 'cat12', icon: Cat12Icon },
  { key: 'cat13', icon: Cat13Icon },
  { key: 'cat14', icon: Cat14Icon },
  { key: 'cat15', icon: Cat15Icon },
  { key: 'cat16', icon: Cat16Icon },
  { key: 'cat17', icon: Cat17Icon },
  { key: 'cat18', icon: Cat18Icon },
  { key: 'cat19', icon: Cat19Icon },
  { key: 'cat20', icon: Cat20Icon },
  { key: 'cat21', icon: Cat21Icon },
  { key: 'cat22', icon: Cat22Icon },
  { key: 'cat23', icon: Cat23Icon },
  { key: 'cat24', icon: Cat24Icon },
  { key: 'cat25', icon: Cat25Icon },
  { key: 'cat26', icon: Cat26Icon },
  { key: 'cat27', icon: Cat27Icon },
  { key: 'cat28', icon: Cat28Icon },
  { key: 'cat29', icon: Cat29Icon },
  { key: 'cat30', icon: Cat30Icon }
]

export const getIcon = (key: string) => {
  if (!key) return categoryIcons[0].icon

  const cat = categoryIcons.find(icon => {
    return icon.key === key
  })

  return cat?.icon || categoryIcons[0].icon
}

export const colorPalette = [
  // Rosados
  '#D7A1B5',
  '#C98FA7',
  '#B38EAB',
  '#D1B1C8',
  '#A295CF',
  '#8E83C4',
  '#9C8CC7',
  '#8778B8',
  '#8FA5D6',
  '#7F96CC',
  '#6F88C2',
  '#8A9BB8',
  '#7C8DA8',
  '#8FBFCC',
  '#7FB3BF',
  '#9ECFC3',
  '#7EB5A8',
  '#A9C3A1',
  '#98B290',
  '#CDBE8C',
  '#CFA095'
]

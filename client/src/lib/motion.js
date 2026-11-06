export const fadeUp = {
    hidden: {
        opacity: 0,
        y: 20,
    },

    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: "easeOut",
        }
    }
}

export const fadeIn = {
    hidden: {
        opacity: 0,
    },

    visible: {
        opacity: 1,
        transition: {
            duration: 0.35
        }
    }
}

export const scaleIn = {
    hidden: {
        opacity: 0,
        scale: 0.95,
    },

    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.35,
            ease: "easeOut",
        }
    }
}

export const straggerContainer = {
    hidden: {},

    visible: {
        transition: {
            straggerChildren: 0.08,
        }
    }
}